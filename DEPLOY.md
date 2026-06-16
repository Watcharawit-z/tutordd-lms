# คู่มือ Deploy ขึ้น Vercel — Tutor DD LMS (Phase 5)

> ทำครั้งเดียวจบ หลังจากนั้นแค่ `git push` เว็บก็อัปเดตเอง

---

## 0) สิ่งที่ต้องมีก่อน
- บัญชี **GitHub** (github.com)
- บัญชี **Vercel** (vercel.com) — สมัครด้วย GitHub ได้เลย
- ติดตั้ง **Git** ในเครื่อง (เช็คด้วย `git --version`)
- ไฟล์ `.env.local` ที่มีคีย์ครบ (อยู่ในเครื่องแล้ว — ไฟล์นี้จะ **ไม่** ถูก push ขึ้น GitHub เพราะอยู่ใน .gitignore)

---

## 1) ✅ .gitignore (ตรวจแล้ว ครบ)
ไฟล์ `.gitignore` มีครบแล้ว: `/node_modules`, `/.next/`, `.env.local` (และ `.env`, `.env*.local`)
แปลว่า node_modules / ไฟล์ build / คีย์ลับ จะไม่ถูกอัปขึ้น GitHub — ปลอดภัย

---

## 2) สร้าง GitHub repo + push โค้ด (พิมพ์ใน Terminal ทีละบรรทัด)

เปิด Terminal แล้ว `cd` เข้าโฟลเดอร์โปรเจกต์ก่อน:

```bash
cd tutordd-lms
```

จากนั้นพิมพ์ทีละบรรทัด:

```bash
git init
git add .
git commit -m "Initial commit: Tutor DD LMS"
git branch -M main
```

ตอนนี้ไปสร้าง repo เปล่าใน GitHub:
- เปิด https://github.com/new
- ตั้งชื่อ เช่น `tutordd-lms`
- เลือก **Private** (แนะนำ)
- **อย่า** ติ๊ก "Add a README / .gitignore / license" (เพราะเรามีแล้ว)
- กด **Create repository**

GitHub จะโชว์ URL ของ repo เช่น `https://github.com/USERNAME/tutordd-lms.git`
นำมาต่อท้ายคำสั่งนี้ (เปลี่ยน USERNAME เป็นของคุณ):

```bash
git remote add origin https://github.com/USERNAME/tutordd-lms.git
git push -u origin main
```

> ถ้าถาม username/password: password ให้ใช้ **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens → Generate) ไม่ใช่รหัสผ่านปกติ

เสร็จแล้วรีเฟรชหน้า GitHub — จะเห็นโค้ดทั้งหมดขึ้นไป (ยกเว้น .env.local ที่ถูกซ่อนไว้)

---

## 3) ต่อ Vercel (ทำในเว็บ ไม่ต้องใช้ Terminal)

1. เข้า https://vercel.com → **Log in with GitHub**
2. กด **Add New… → Project**
3. หา repo `tutordd-lms` แล้วกด **Import**
4. หน้า Configure Project:
   - **Framework Preset**: Next.js (ตรวจให้อัตโนมัติ — ไม่ต้องแก้)
   - **Root Directory**: ปล่อยเป็นค่าเริ่มต้น (ถ้าโค้ดอยู่ในโฟลเดอร์ย่อย `tutordd-lms` ใน repo ให้กด Edit แล้วเลือกโฟลเดอร์นั้น)
   - **Build Command / Output**: ปล่อยค่าเริ่มต้น
5. กดเปิดหัวข้อ **Environment Variables** แล้วใส่ตามตารางข้อ 4 (สำคัญมาก ต้องใส่ก่อน deploy)
6. กด **Deploy** แล้วรอ ~1–2 นาที
7. เสร็จแล้วจะได้ URL เช่น `https://tutordd-lms.vercel.app`

---

## 4) Environment Variables ที่ต้องใส่ใน Vercel

ไปที่ **Project → Settings → Environment Variables** (หรือใส่ตอน import) เลือก scope = **Production, Preview, Development** ทั้งหมด

ค่าทั้งหมด **ก๊อปจากไฟล์ `.env.local` ในเครื่อง** (ค่าเดียวกันเป๊ะ) ยกเว้น `NEXT_PUBLIC_SITE_URL` ที่ต้องเปลี่ยนเป็น URL ของ Vercel

### กลุ่มที่ "จำเป็นต้องมี" ให้เว็บทำงานตอนนี้
| Key | ค่าที่ใส่ |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL ที่ Vercel ให้ เช่น `https://tutordd-lms.vercel.app` (ตอนแรกใส่ค่านี้ไปก่อน แล้วค่อยแก้ถ้าใช้ domain จริง) |
| `NEXT_PUBLIC_SUPABASE_URL` | ค่าเดียวกับใน `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ค่าเดียวกับใน `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | ค่าเดียวกับใน `.env.local` (คีย์ลับ — ใส่เฉพาะใน Vercel ห้ามเปิดเผย) |

### กลุ่ม "ใส่ได้เลยถ้ามี / หรือเว้นไว้ก่อน" (ใช้จริงตอน Phase 4)
| Key | หมายเหตุ |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ใส่ได้เลย (test key) หรือเว้นว่าง |
| `STRIPE_SECRET_KEY` | Phase 4 |
| `STRIPE_WEBHOOK_SECRET` | Phase 4 (ได้หลังตั้ง webhook ชี้มา domain จริง) |
| `STRIPE_M1_PRICE_ID` | Phase 4 |
| `STRIPE_M4_PRICE_ID` | Phase 4 |
| `BUNNY_STREAM_LIBRARY_ID` | Phase 4 |
| `BUNNY_STREAM_API_KEY` | Phase 4 |
| `BUNNY_CDN_HOSTNAME` | Phase 4 |
| `BUNNY_TOKEN_AUTH_KEY` | Phase 4 |
| `RESEND_API_KEY` | Phase 4 (ส่งอีเมล) |
| `NEXT_PUBLIC_TAWK_ID` | ไม่จำเป็น (ตั้งค่าแชทผ่านหน้า /admin/settings ได้เลย) |

> **สำคัญ:** ทุกครั้งที่เพิ่ม/แก้ Environment Variable ใน Vercel ต้องกด **Redeploy** (Deployments → … → Redeploy) ค่าจึงจะมีผล

> หลัง deploy อย่าลืม: ใน Supabase → Authentication → URL Configuration ใส่ **Site URL** เป็น URL ของ Vercel และเพิ่มใน **Redirect URLs** ด้วย (เพื่อให้ลิงก์ยืนยันอีเมลทำงาน)

---

## 5) อัปเดตเว็บหลัง deploy — แค่ push ก็พอ

Vercel ผูกกับ GitHub แล้ว ทุกครั้งที่ push ขึ้น branch `main` มันจะ build + deploy ให้อัตโนมัติ
แก้โค้ดในเครื่องเสร็จ พิมพ์ 3 บรรทัดนี้:

```bash
git add .
git commit -m "อธิบายสั้น ๆ ว่าแก้อะไร"
git push
```

รอ ~1–2 นาที เว็บจริงจะอัปเดตเอง (ดูสถานะได้ที่แท็บ Deployments ใน Vercel)

> เคล็ดลับ: ทุก push จะได้ "Preview URL" แยกให้ลองก่อน ส่วน `main` = เว็บ production จริง

---

## 6) ผูก Custom Domain (เช่น tutordd.com) — ทำทีหลังได้

1. ซื้อโดเมนจากผู้ให้บริการใดก็ได้ (GoDaddy, Namecheap, Cloudflare, ฯลฯ)
2. ใน Vercel: **Project → Settings → Domains → Add** แล้วพิมพ์ `tutordd.com`
3. Vercel จะบอกค่า DNS ที่ต้องตั้ง — เอาไปใส่ที่ผู้ให้บริการโดเมน:
   - โดเมนหลัก `tutordd.com` → ตั้ง record ตามที่ Vercel บอก (ปกติเป็น A record ชี้ไป `76.76.21.21` หรือใช้ nameserver ของ Vercel)
   - `www.tutordd.com` → CNAME ไป `cname.vercel-dns.com`
4. รอ DNS อัปเดต (ไม่กี่นาที–ไม่กี่ชม.) Vercel จะออกใบรับรอง HTTPS ให้อัตโนมัติ
5. เมื่อโดเมนใช้งานได้:
   - แก้ `NEXT_PUBLIC_SITE_URL` ใน Vercel เป็น `https://tutordd.com` แล้ว Redeploy
   - อัปเดต Supabase → Authentication → Site URL / Redirect URLs เป็น `https://tutordd.com`
   - (Phase 4) อัปเดต Stripe webhook endpoint ให้ชี้มาที่ `https://tutordd.com/api/webhook/stripe`

---

## เช็กลิสต์ก่อนถือว่าเสร็จ
- [ ] push ขึ้น GitHub สำเร็จ (เห็นโค้ดใน repo, ไม่มี .env.local)
- [ ] ใส่ env 4 ตัวหลัก (SITE_URL + Supabase 3 ตัว) ใน Vercel
- [ ] รัน SQL ทุกไฟล์ใน Supabase แล้ว (schema, seed, admin, portfolio, settings)
- [ ] เปิด URL ของ Vercel → หน้าแรกขึ้น, สมัคร/ล็อกอินได้, /admin เข้าได้ (หลังตั้ง role admin)
- [ ] ตั้ง Supabase Site URL/Redirect URLs เป็น URL ของ Vercel
