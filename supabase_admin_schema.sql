-- =============================================================
-- Tutor DD LMS — Phase 3 (Admin) เพิ่มเติมจาก schema เดิม
-- เปิด Supabase → SQL Editor → วางทั้งไฟล์ → Run (รันซ้ำได้ ปลอดภัย)
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1) page_views : แทร็กการเข้าชมหน้าสินค้า (ใช้ทำ funnel / analytics)
-- -------------------------------------------------------------
create table if not exists public.page_views (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  session_id  text,
  viewed_at   timestamptz not null default now()
);

create index if not exists page_views_product_idx on public.page_views(product_id);
create index if not exists page_views_viewed_idx on public.page_views(viewed_at);

-- -------------------------------------------------------------
-- 2) reviews : เพิ่มคอลัมน์ is_visible (อนุมัติ/ซ่อน)
-- -------------------------------------------------------------
alter table public.reviews
  add column if not exists is_visible boolean not null default true;

-- -------------------------------------------------------------
-- 3) products : เพิ่มคอลัมน์รูป thumbnail (เก็บ URL จาก Supabase Storage)
-- -------------------------------------------------------------
alter table public.products
  add column if not exists thumbnail_url text;

-- (products.sheet_storage_path มีอยู่แล้วใน schema หลัก — เก็บ path ของ PDF)

-- -------------------------------------------------------------
-- 4) orders : เพิ่มวิธีชำระเงิน (โชว์ในหน้าออเดอร์)
-- -------------------------------------------------------------
alter table public.orders
  add column if not exists payment_method text;   -- เช่น 'promptpay' | 'card'

-- -------------------------------------------------------------
-- RLS สำหรับ page_views
-- เขียน (insert) ทำผ่าน service_role ฝั่ง server (ข้าม RLS อยู่แล้ว)
-- อ่านได้เฉพาะ admin
-- -------------------------------------------------------------
alter table public.page_views enable row level security;

drop policy if exists "page_views admin read" on public.page_views;
create policy "page_views admin read" on public.page_views
  for select using (public.is_admin());

-- หมายเหตุ: ฟังก์ชัน public.is_admin() ถูกสร้างไว้แล้วใน supabase_schema.sql

-- =============================================================
-- Storage buckets (รันใน SQL Editor ได้เลย หรือสร้างผ่านหน้า Storage UI)
-- - thumbnails : รูปปกสินค้า (อ่านได้สาธารณะ)
-- - sheets     : ไฟล์ PDF ของชีท (ห้ามอ่านสาธารณะ — ออก signed URL ใน Phase 4)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('sheets', 'sheets', false)
on conflict (id) do nothing;

-- ให้ทุกคนอ่านรูป thumbnail ได้ (bucket public อยู่แล้ว แต่ตั้ง policy กันเหนียว)
drop policy if exists "thumbnails public read" on storage.objects;
create policy "thumbnails public read" on storage.objects
  for select using (bucket_id = 'thumbnails');

-- การอัปโหลด/ลบไฟล์ ทำผ่าน service_role ฝั่ง server (ข้าม RLS) — ไม่ต้องมี policy ให้ client
