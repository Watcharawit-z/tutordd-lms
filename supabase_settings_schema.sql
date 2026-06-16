-- =============================================================
-- Tutor DD LMS — ระบบ "ตั้งค่าเว็บไซต์" (site_settings + instructors)
-- เปิด Supabase → SQL Editor → วางทั้งไฟล์ → Run (รันซ้ำได้ ปลอดภัย)
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1) site_settings : เก็บค่าตั้งค่าทั่วไปแบบ key-value
-- -------------------------------------------------------------
create table if not exists public.site_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select using (true);

drop policy if exists "admin manage settings" on public.site_settings;
create policy "admin manage settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ค่าเริ่มต้น (ใส่เฉพาะ key ที่ยังไม่มี)
insert into public.site_settings (key, value) values
  ('site_name', 'Tutor DD'),
  ('site_tagline', 'สถาบันกวดวิชาออนไลน์ คณิต–วิทย์'),
  ('contact_line', '@tutordd'),
  ('contact_email', 'support@tutordd.com'),
  ('contact_hours', 'ทุกวัน 9:00–20:00'),
  ('contact_phone', '094 364 5323'),
  ('social_facebook', ''),
  ('social_tiktok', ''),
  ('social_youtube', ''),
  ('social_line_url', 'https://line.me/R/ti/p/@tutordd'),
  ('hero_headline', 'ติวเข้มกับติวเตอร์อันดับต้นๆ ของอุบล'),
  ('hero_subheadline', 'คอร์สออนไลน์และชีทสรุปคณิต–วิทย์'),
  ('stat_students', '1200'),
  ('stat_years', '12'),
  ('stat_rating', '4.9'),
  ('stat_recommend', '98'),
  ('cta_line_url', 'https://line.me/R/ti/p/@tutordd'),
  ('tawk_id', '')
on conflict (key) do nothing;

-- -------------------------------------------------------------
-- 2) instructors : ผู้สอน (รองรับหลายคน)
-- -------------------------------------------------------------
create table if not exists public.instructors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  title       text,
  bio         text,
  image_url   text,
  tags        text[],
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists instructors_sort_idx on public.instructors(sort_order);

alter table public.instructors enable row level security;

drop policy if exists "public read instructors" on public.instructors;
create policy "public read instructors" on public.instructors
  for select using (is_active or public.is_admin());

drop policy if exists "admin manage instructors" on public.instructors;
create policy "admin manage instructors" on public.instructors
  for all using (public.is_admin()) with check (public.is_admin());

-- ผู้สอนคนแรก (ใส่เฉพาะถ้ายังไม่มีผู้สอนเลย)
insert into public.instructors (name, title, bio, tags, sort_order)
select
  'ครูดีดี (พี่ดีดี)',
  'ผู้ก่อตั้ง Tutor DD · ติวเตอร์คณิต–วิทย์',
  'ปริญญาโทด้านวิทยาศาสตร์ ประสบการณ์ติวเตอร์กว่า 12 ปี เชี่ยวชาญการปูพื้นฐานและทำโจทย์สอบเข้า ม.1 และ ม.4',
  ARRAY['ปริญญาโท วิทยาศาสตร์', 'ติวเตอร์มืออาชีพ 12 ปี', 'ออกแบบคอร์สตามแนวข้อสอบจริง'],
  0
where not exists (select 1 from public.instructors);
