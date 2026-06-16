# Tutor DD LMS

เว็บขายคอร์สออนไลน์ + ชีทสรุป PDF + แพ็กบุฟเฟต์รายเดือน สำหรับสถาบันกวดวิชา คณิต–วิทย์ (เตรียมสอบเข้า ม.1 / ม.4)
สร้างด้วย **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase**

> สถานะ: **Phase 3 เสร็จแล้ว** — ระบบหลังบ้าน (Admin Dashboard) ครบ 8 หน้า สำหรับผู้สอนจัดการเองได้

---

## ติดตั้งและรัน

ต้องมี **Node.js 18.18+ (แนะนำ 20/22)**

```bash
cd tutordd-lms
npm install        # สำคัญ: รันใหม่เพราะมี dependency เพิ่ม (@supabase/ssr, @supabase/supabase-js)
npm run dev
```

เปิด http://localhost:3000

### ตั้งค่า .env.local
คัดลอกจาก `.env.example` แล้วกรอกคีย์ (ของ Phase 2 ต้องมีอย่างน้อยกลุ่ม Supabase):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...        # จาก Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # จาก Supabase
SUPABASE_SERVICE_ROLE_KEY=...       # จาก Supabase (ฝั่ง server เท่านั้น)
```
(คีย์ Stripe / Bunny / Resend ใส่ในเฟสถัดไป)

---

## ฐานข้อมูล (Supabase)

> ⚠️ **โค้ดอ้างชื่อคอลัมน์ตาม `supabase_schema.sql` แบบตรงตัว**
> ถ้าตารางเดิมที่คุณรันไว้ใช้ชื่อคอลัมน์ต่างจากนี้ (เช่น `products` ไม่มี `short_desc`, `cover_color`, `tier`, `featured`) หน้าเว็บจะดึงข้อมูลไม่ขึ้น
> วิธีแก้ที่ปลอดภัยสุด: เปิด Supabase → SQL Editor แล้ว

1. รัน **`supabase_schema.sql`** (idempotent — ใช้ `if not exists` ปลอดภัย)
2. รัน **`supabase_seed.sql`** เพื่อใส่คอร์ส/ชีท/แพ็ก/รีวิวตัวอย่าง
3. ถ้า `products` เดิมมีอยู่แล้วแต่คอลัมน์ไม่ครบ → เพิ่มคอลัมน์ที่ขาด หรือ `drop table ... cascade;` แล้วรัน schema ใหม่ (ถ้ายังไม่มีข้อมูลจริง)

ตารางในระบบ: `profiles, products, course_lessons, orders, entitlements, lesson_progress, reviews, subscription_plans, subscriptions` พร้อม Row Level Security ครบ

### ตั้ง Admin คนแรก (รันหลังสมัครสมาชิกแล้ว)
สมัครบัญชีในเว็บก่อน (`/register`) จากนั้นเปิด Supabase → SQL Editor → รัน:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'banksadid@gmail.com');
```

(เปลี่ยนอีเมลเป็นบัญชีที่ต้องการให้เป็นแอดมิน) จากนั้นรีเฟรช — เมนู "หลังบ้าน" จะปรากฏ และเข้า `/admin` ได้

---

## หน้าทั้งหมด

| เส้นทาง | คำอธิบาย | สิทธิ์ |
|---|---|---|
| `/` | หน้าแรก (hero, trust strip, สถิติ, คอร์สเด่น, รีวิว, ผู้สอน) | ทุกคน |
| `/courses` | รายการคอร์สออนไลน์ (จาก DB) | ทุกคน |
| `/sheets` | รายการชีท (จาก DB) | ทุกคน |
| `/plans` | เปรียบเทียบแพ็กบุฟเฟต์ ม.1 vs ม.4 + รายการเนื้อหาในแพ็ก | ทุกคน |
| `/product/[slug]` | หน้าสินค้า + สารบัญ + รีวิว + กล่องราคา (รู้ว่าคุณมีสิทธิ์แล้วหรือยัง) | ทุกคน |
| `/portfolio` | ผลงานนักเรียนแบบกริด Instagram (hover ดูรายละเอียด, กดเปิด lightbox) | ทุกคน |
| `/login`, `/register` | เข้าสู่ระบบ/สมัคร (Supabase Auth จริง) | ทุกคน |
| `/learn` | คอร์สของฉัน — แสดงสินค้าที่ซื้อเดี่ยว + ที่ได้จากแพ็ก + สถานะ subscription | ต้องล็อกอิน |
| `/learn/[productId]` | Player/ดาวน์โหลด (ตรวจสิทธิ์ฝั่ง server แล้ว, ตัวเล่นจริงใน Phase 4) | ต้องมีสิทธิ์ |
| `/account/subscription` | จัดการแพ็ก (สถานะ/วันต่ออายุ/ยกเลิก) | ต้องล็อกอิน |
| `/admin` | dashboard ผู้สอน (นับสถิติจาก DB) | role = admin |

`middleware.ts` ป้องกัน `/learn`, `/account`, `/admin` (และเช็ค role admin สำหรับ `/admin`)

---

## โครงสร้างที่เพิ่ม/แก้ใน Phase 2

```
lib/
├─ types.ts              # type กลาง (Product, Plan, Subscription) + formatTHB, tierLabel
├─ content.ts            # ข้อความ static (สถิติ, ผู้สอน)
├─ queries.ts            # ดึงข้อมูลจาก Supabase + map row → type
├─ access.ts             # hasAccess() รวม entitlement + subscription
└─ supabase/
   ├─ client.ts          # browser client (anon)
   ├─ server.ts          # server client (cookies) + admin client (service_role)
   └─ middleware.ts      # รีเฟรช session + ป้องกันเส้นทาง
middleware.ts            # เรียก updateSession
app/(auth)/actions.ts    # server actions: login / register / logout
```

---

## โหมดสิทธิ์เข้าถึง (`lib/access.ts`)
```
hasAccess(user, product) =
  มี entitlement ตรง ๆ (ซื้อเดี่ยว)
  OR มี subscription ที่ status='active' และยังไม่หมดอายุ และ tier ตรงกับ product.tier
```
`product.tier` = `'M1' | 'M4' | 'both' | null` (null = ซื้อเดี่ยวเท่านั้น, both = อยู่ทั้งสองแพ็ก)

---

---

## หลังบ้าน (Admin) — Phase 3

### ก่อนใช้งาน ต้องรัน SQL เพิ่ม
เปิด Supabase → SQL Editor → รัน **`supabase_admin_schema.sql`** (รันซ้ำได้)
ไฟล์นี้จะ: สร้างตาราง `page_views`, เพิ่มคอลัมน์ `reviews.is_visible`, `products.thumbnail_url`,
`orders.payment_method`, และสร้าง Storage bucket **`thumbnails`** (รูปปก, อ่านสาธารณะ) + **`sheets`** (PDF, ไม่สาธารณะ)

จากนั้นรัน **`supabase_portfolio_schema.sql`** เพิ่มอีกไฟล์ (ระบบผลงานนักเรียน):
สร้างตาราง `portfolio_posts`, เพิ่ม `reviews.image_url` + `reviews.result_label`, และสร้าง bucket **`portfolio`** (public)

และรัน **`supabase_settings_schema.sql`** (ระบบตั้งค่าเว็บ):
สร้างตาราง `site_settings` (ค่าตั้งต้นครบ) + `instructors` (ผู้สอน, รองรับหลายคน) พร้อม RLS
(รูปผู้สอนใช้ bucket `thumbnails` ที่สร้างไว้แล้ว)

> ถ้าสร้าง bucket ผ่าน SQL ไม่ได้ (สิทธิ์ไม่พอ) ให้ไปที่ Supabase → Storage → New bucket
> สร้าง `thumbnails` (เปิด Public) และ `sheets` (ปิด Public) ด้วยมือ

### หน้าหลังบ้านทั้งหมด (เข้าได้เฉพาะ role = admin)
| เส้นทาง | ทำอะไรได้ |
|---|---|
| `/admin` | ภาพรวมธุรกิจ: รายได้วันนี้/เดือนนี้, นักเรียน, ผู้กำลังเรียน, subscriber ม.1/ม.4, กราฟรายได้ 30 วัน, คอร์สขายดี Top 5, ออเดอร์ล่าสุด, นักเรียนใหม่ |
| `/admin/products` | ตารางคอร์ส/ชีท + filter + ค้นหา, สลับ Published/Draft ทันที, แก้ไข, ลบ (มี confirm) |
| `/admin/products/new` · `/[id]/edit` | ฟอร์มเพิ่ม/แก้ไขสินค้า + อัปโหลดรูป/PDF + กำหนด tier + featured + บันทึกร่าง/เผยแพร่ |
| `/admin/products/[id]/lessons` | จัดการบทเรียน: ลาก-วางเรียงลำดับ, เพิ่ม/แก้ไข/ลบ, toggle ดูฟรี, สถิติคนดูจบรายบท |
| `/admin/analytics` | funnel (เข้าชม→ซื้อ→ชำระ), retention 7/14/30 วัน, อัตราเรียนจบรายคอร์ส |
| `/admin/students` · `/[id]` | รายชื่อนักเรียน + ค้นหา, รายละเอียดประวัติซื้อ + ความคืบหน้า + subscription |
| `/admin/plans` | แก้ชื่อ/ราคา/คำอธิบายแพ็ก, จำนวน subscriber + รายได้, กำหนด tier ของแต่ละสินค้า |
| `/admin/orders` | ตารางออเดอร์ + filter (สถานะ/ประเภท/ช่วงวันที่) + ดาวน์โหลด CSV (เปิดใน Excel ภาษาไทยได้) |
| `/admin/reviews` | เพิ่มรีวิว (แนบรูป + ผลลัพธ์), เปิด/ซ่อน, ปักหมุดขึ้นหน้าแรก, ลบ |
| `/admin/portfolio` | ผลงานนักเรียน: อัปโหลดรูป (jpg/png/webp ≤5MB), caption/ชื่อ/ผลลัพธ์/คอร์ส, ลาก-วางเรียง, แสดง/ซ่อน, ลบ |
| `/admin/settings` | ตั้งค่าเว็บ 3 แท็บ: ข้อมูลทั่วไป (ชื่อ/hero/สถิติ), ติดต่อและโซเชียล (+ Tawk.to live chat), ผู้สอน (เพิ่ม/แก้/ลบ/เรียง + อัปรูป + preview) |

หลักการ UI: ภาษาไทยทั้งหมด, ปุ่มใหญ่+ไอคอน, confirm ก่อนลบทุกครั้ง, toast แจ้งผล, เงิน ฿1,990 / วันที่ พ.ศ., ใช้บน iPad ได้

> หมายเหตุ: ตัวเลขออเดอร์/รายได้จะขึ้นจริงเมื่อมีข้อมูลในตาราง `orders`/`entitlements` ซึ่งระบบชำระเงินจะสร้างให้ใน Phase 4
> ตอนนี้ยังเพิ่ม/แก้คอร์ส, บทเรียน, แพ็ก, รีวิว และดูนักเรียนได้เต็มที่

---

## เฟสถัดไป
- **Phase 4** — Stripe Checkout (ซื้อเดี่ยว) + Subscription + webhook + Customer Portal, player ต่อ Bunny signed URL, ดาวน์โหลดชีท, อีเมลใบเสร็จ
- **Phase 5** — Deploy Vercel + env + Stripe webhook + live mode

> ห้าม commit `.env.local`
```
