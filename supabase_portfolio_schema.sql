-- =============================================================
-- Tutor DD LMS — ระบบ "ผลงานนักเรียน" (Portfolio) + อัปเกรดรีวิว
-- เปิด Supabase → SQL Editor → วางทั้งไฟล์ → Run (รันซ้ำได้ ปลอดภัย)
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1) portfolio_posts : รูปผลงาน/ความสำเร็จของนักเรียน (กริดแบบ Instagram)
-- -------------------------------------------------------------
create table if not exists public.portfolio_posts (
  id            uuid primary key default gen_random_uuid(),
  image_url     text not null,
  caption       text,
  student_name  text,
  result_label  text,                       -- เช่น 'สอบติด ร.ร.เตรียมอุดมฯ'
  product_id    uuid references public.products(id) on delete set null,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists portfolio_sort_idx on public.portfolio_posts(sort_order);

alter table public.portfolio_posts enable row level security;

-- ใครก็อ่านได้เฉพาะที่เผยแพร่ / admin จัดการได้ทั้งหมด
drop policy if exists "public read portfolio" on public.portfolio_posts;
create policy "public read portfolio" on public.portfolio_posts
  for select using (is_published or public.is_admin());

drop policy if exists "admin manage portfolio" on public.portfolio_posts;
create policy "admin manage portfolio" on public.portfolio_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- 2) reviews : เพิ่มรูปประกอบ + ป้ายผลลัพธ์
-- -------------------------------------------------------------
alter table public.reviews
  add column if not exists image_url text;
alter table public.reviews
  add column if not exists result_label text;   -- เช่น 'สอบติด ม.4 เตรียมอุดมฯ'

-- =============================================================
-- 3) Storage bucket : portfolio (public — โชว์รูปผลงานบนเว็บได้)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "portfolio public read" on storage.objects;
create policy "portfolio public read" on storage.objects
  for select using (bucket_id = 'portfolio');

-- การอัปโหลด/ลบไฟล์ ทำผ่าน service_role ฝั่ง server (ข้าม RLS) — ไม่ต้องมี policy ให้ client

-- (ถ้าสร้าง bucket ผ่าน SQL ไม่ได้ ให้ไปที่ Supabase → Storage → New bucket
--  ตั้งชื่อ 'portfolio' และเปิด Public)
