-- =============================================================
-- Tutor DD LMS — ข้อมูลตัวอย่าง (Seed)
-- รันหลัง supabase_schema.sql เพื่อให้มีคอร์ส/ชีท/แพ็ก/รีวิว โชว์บนเว็บ
-- รันซ้ำได้ (ใช้ on conflict กับ slug/ชื่อ)
-- =============================================================

-- ---------- แพ็กบุฟเฟต์ ----------
insert into public.subscription_plans (name, tier, price_thb, description, is_active)
values
  ('ม.1 Package', 'M1', 590, 'ดูคอร์สและชีททุกตัวระดับเตรียมสอบเข้า ม.1 ได้ไม่จำกัด ตราบที่ยังเป็นสมาชิก', true),
  ('ม.4 Package', 'M4', 690, 'ดูคอร์สและชีททุกตัวระดับเตรียมสอบเข้า ม.4 ได้ไม่จำกัด ตราบที่ยังเป็นสมาชิก', true)
on conflict do nothing;

-- ---------- สินค้า (คอร์ส + ชีท) ----------
insert into public.products
  (slug, type, status, title, subject, level, short_desc, description, price_thb, old_price_thb, cover_color, pages, tier, featured)
values
  ('math-entrance-m1', 'course', 'published',
   'คณิตศาสตร์ พิชิตสอบเข้า ม.1', 'คณิตศาสตร์', 'สอบเข้า ม.1',
   'ปูพื้นฐาน + ตะลุยโจทย์แนวสอบเข้า ม.1 ครบทุกบท',
   'คอร์สเตรียมสอบเข้า ม.1 วิชาคณิตศาสตร์ ครอบคลุมเนื้อหา ป.4–ป.6 พร้อมเทคนิคทำโจทย์เร็ว แบ่งเป็นบทเรียนสั้น ๆ ดูซ้ำได้ไม่จำกัด มีแบบฝึกหัดท้ายบทและเฉลยละเอียด',
   1290, 1990, '#1d4280', null, 'M1', true),
  ('science-entrance-m1', 'course', 'published',
   'วิทยาศาสตร์ เตรียมสอบเข้า ม.1', 'วิทยาศาสตร์', 'สอบเข้า ม.1',
   'สรุปเนื้อหาวิทย์ ป.ปลาย + โจทย์แนวสอบเข้า',
   'คอร์สวิทยาศาสตร์สำหรับสอบเข้า ม.1 สรุปเนื้อหาสำคัญทั้งฟิสิกส์ เคมี ชีวะ และโลกดาราศาสตร์ในระดับประถม อธิบายด้วยภาพและตัวอย่างใกล้ตัว พร้อมโจทย์แนวสอบจริงทุกบท',
   1190, 1690, '#23529c', null, 'M1', true),
  ('math-entrance-m4', 'course', 'published',
   'คณิตศาสตร์ ตะลุยสอบเข้า ม.4', 'คณิตศาสตร์', 'สอบเข้า ม.4',
   'เจาะลึกพีชคณิต–เรขาคณิต แนวสอบเข้า ม.4',
   'คอร์สคณิตศาสตร์เข้มข้นสำหรับสอบเข้า ม.4 ครอบคลุมเนื้อหา ม.ต้นทั้งหมด เน้นพีชคณิต สมการ ฟังก์ชัน และเรขาคณิต พร้อมเทคนิคทำข้อสอบแข่งขัน',
   1490, null, '#173461', null, 'M4', true),
  ('science-entrance-m4', 'course', 'published',
   'วิทยาศาสตร์ ตะลุยสอบเข้า ม.4', 'วิทยาศาสตร์', 'สอบเข้า ม.4',
   'ฟิสิกส์–เคมี–ชีวะ แนวสอบเข้า ม.4 สายวิทย์',
   'คอร์สวิทยาศาสตร์เข้มข้นสำหรับสอบเข้า ม.4 สายวิทย์–คณิต ครอบคลุมเนื้อหา ม.ต้นทั้งหมด พร้อมโจทย์แนวข้อสอบจริงและเฉลยละเอียด',
   1390, 1890, '#122845', null, 'M4', true),
  ('sheet-math-m1-summary', 'sheet', 'published',
   'ชีทสรุปคณิต สอบเข้า ม.1', 'คณิตศาสตร์', 'สอบเข้า ม.1',
   'สรุปสูตร + โจทย์พร้อมเฉลย 120 หน้า',
   'ชีทสรุปคณิตศาสตร์สำหรับสอบเข้า ม.1 รวมสูตรสำคัญ เทคนิคจำ และโจทย์แนวสอบพร้อมเฉลยละเอียด อ่านทบทวนก่อนสอบได้ครบในเล่มเดียว',
   290, 390, '#2f68b8', 120, 'M1', false),
  ('sheet-science-m1-summary', 'sheet', 'published',
   'ชีทสรุปวิทย์ สอบเข้า ม.1', 'วิทยาศาสตร์', 'สอบเข้า ม.1',
   'สรุปเนื้อหาวิทย์ + ข้อสอบเก่า 100 หน้า',
   'ชีทสรุปวิทยาศาสตร์สอบเข้า ม.1 รวมเนื้อหาสำคัญทุกสาระ พร้อมแผนภาพช่วยจำและข้อสอบเก่าพร้อมเฉลย',
   250, null, '#5187cf', 100, 'M1', false),
  ('sheet-math-m4-summary', 'sheet', 'published',
   'ชีทสรุปคณิต สอบเข้า ม.4', 'คณิตศาสตร์', 'สอบเข้า ม.4',
   'รวมสูตร ม.ต้น + โจทย์ขั้นสูง 150 หน้า',
   'ชีทสรุปคณิตศาสตร์สอบเข้า ม.4 รวมสูตรและทฤษฎีบทระดับ ม.ต้นทั้งหมด พร้อมโจทย์ระดับแข่งขันและเฉลยแบบ step-by-step',
   320, null, '#1d4280', 150, 'M4', false)
on conflict (slug) do nothing;

-- ---------- บทเรียน (course_lessons) ----------
-- คณิต ม.1
insert into public.course_lessons (product_id, title, duration_min, is_free_preview, sort_order)
select p.id, v.title, v.dur, v.free, v.ord
from public.products p
join (values
  ('บทนำ & แนวข้อสอบเข้า ม.1', 18, true, 1),
  ('จำนวนและการดำเนินการ', 42, false, 2),
  ('เศษส่วนและทศนิยม', 38, false, 3),
  ('ร้อยละและการประยุกต์', 35, false, 4),
  ('เรขาคณิตเบื้องต้น', 40, false, 5),
  ('โจทย์ปัญหา & ตะลุยข้อสอบ', 55, false, 6)
) as v(title, dur, free, ord) on true
where p.slug = 'math-entrance-m1'
  and not exists (select 1 from public.course_lessons cl where cl.product_id = p.id);

-- วิทย์ ม.1
insert into public.course_lessons (product_id, title, duration_min, is_free_preview, sort_order)
select p.id, v.title, v.dur, v.free, v.ord
from public.products p
join (values
  ('วิทยาศาสตร์รอบตัว & แนวข้อสอบ', 15, true, 1),
  ('สิ่งมีชีวิตและสิ่งแวดล้อม', 36, false, 2),
  ('สสารและการเปลี่ยนแปลง', 33, false, 3),
  ('แรงและพลังงาน', 39, false, 4),
  ('โลก ดาราศาสตร์ และอวกาศ', 30, false, 5)
) as v(title, dur, free, ord) on true
where p.slug = 'science-entrance-m1'
  and not exists (select 1 from public.course_lessons cl where cl.product_id = p.id);

-- คณิต ม.4
insert into public.course_lessons (product_id, title, duration_min, is_free_preview, sort_order)
select p.id, v.title, v.dur, v.free, v.ord
from public.products p
join (values
  ('ภาพรวมข้อสอบเข้า ม.4 & การวางแผนอ่าน', 20, true, 1),
  ('พหุนามและการแยกตัวประกอบ', 48, false, 2),
  ('สมการและอสมการ', 44, false, 3),
  ('ฟังก์ชันและกราฟ', 50, false, 4),
  ('เรขาคณิตและตรีโกณมิติเบื้องต้น', 46, false, 5),
  ('ตะลุยข้อสอบเก่า + เฉลยละเอียด', 60, false, 6)
) as v(title, dur, free, ord) on true
where p.slug = 'math-entrance-m4'
  and not exists (select 1 from public.course_lessons cl where cl.product_id = p.id);

-- วิทย์ ม.4
insert into public.course_lessons (product_id, title, duration_min, is_free_preview, sort_order)
select p.id, v.title, v.dur, v.free, v.ord
from public.products p
join (values
  ('ภาพรวมข้อสอบวิทย์เข้า ม.4', 16, true, 1),
  ('ฟิสิกส์: แรง การเคลื่อนที่ พลังงาน', 52, false, 2),
  ('เคมี: สสารและปฏิกิริยา', 47, false, 3),
  ('ชีววิทยา: เซลล์และระบบร่างกาย', 45, false, 4),
  ('ตะลุยข้อสอบเก่า + เฉลย', 58, false, 5)
) as v(title, dur, free, ord) on true
where p.slug = 'science-entrance-m4'
  and not exists (select 1 from public.course_lessons cl where cl.product_id = p.id);

-- หัวข้อตัวอย่างของชีท (1 แถว = ดูฟรี)
insert into public.course_lessons (product_id, title, duration_min, is_free_preview, sort_order)
select p.id, 'ตัวอย่างเนื้อหา (ดูฟรี)', 0, true, 1
from public.products p
where p.type = 'sheet'
  and not exists (select 1 from public.course_lessons cl where cl.product_id = p.id);

-- ---------- รีวิว ----------
insert into public.reviews (product_id, student_name, school, rating, comment, is_featured)
values
  (null, 'น้องปุ๊กกี้', 'สอบติด ร.ร.สวนกุหลาบฯ', 5,
   'คอร์สคณิตสอบเข้า ม.1 ช่วยได้มากค่ะ ครูอธิบายเข้าใจง่าย ดูซ้ำได้เรื่อย ๆ ทำให้มั่นใจตอนสอบจริง', true),
  (null, 'น้องเจ', 'สอบติด ร.ร.เตรียมอุดมฯ', 5,
   'ติวเข้า ม.4 สายวิทย์–คณิต โจทย์ในคอร์สตรงแนวมาก ชีทสรุปก็ดีอ่านก่อนสอบทันเวลา', true),
  (null, 'คุณแม่น้องอชิ', 'ผู้ปกครอง', 5,
   'ประทับใจที่ลูกเรียนเองได้ที่บ้าน ระบบเข้าเรียนง่าย ไม่ต้องเดินทาง คุ้มค่ามากค่ะ', true)
on conflict do nothing;
