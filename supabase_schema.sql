-- =============================================================
-- Tutor DD LMS — Database Schema (Phase 2)
-- เปิด Supabase → SQL Editor → วางทั้งไฟล์นี้ → Run
--
-- ⚠️ สำคัญ: โค้ดในเว็บ (lib/queries.ts, lib/access.ts) อ้างชื่อคอลัมน์
-- ตามไฟล์นี้ "ตรงตัว" ถ้าสคีมาที่คุณรันไว้ก่อนหน้าใช้ชื่อคอลัมน์ต่างจากนี้
-- ให้รันไฟล์นี้ทับ (ปลอดภัย เพราะใช้ if not exists / create or replace)
-- หรือแจ้งผมเพื่อปรับโค้ดให้ตรงกับของคุณ
-- =============================================================

-- ให้ generate uuid ได้
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1) profiles : ข้อมูลผู้ใช้ + บทบาท (student / admin)
--    ผูกกับ auth.users (ระบบ Auth ของ Supabase)
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'student',   -- 'student' | 'admin'
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2) products : คอร์ส + ชีท (สินค้าทุกชนิดอยู่ตารางเดียว แยกด้วย type)
-- -------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  type          text not null,                    -- 'course' | 'sheet'
  status        text not null default 'draft',    -- 'published' | 'draft'
  title         text not null,
  subject       text not null,                    -- 'คณิตศาสตร์' | 'วิทยาศาสตร์'
  level         text not null,                    -- เช่น 'สอบเข้า ม.1'
  short_desc    text,
  description   text,
  price_thb     integer not null default 0,
  old_price_thb integer,
  cover_color   text default '#1d4280',
  pages         integer,                          -- เฉพาะชีท
  tier          text default 'both',              -- 'M1' | 'M4' | 'both' | null
  featured      boolean not null default false,
  -- สำหรับเฟสถัดไป (อัปวิดีโอ/ไฟล์)
  bunny_collection_id text,
  sheet_storage_path  text,
  created_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 3) course_lessons : บทเรียนของคอร์ส (หรือหัวข้อตัวอย่างของชีท)
-- -------------------------------------------------------------
create table if not exists public.course_lessons (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  title           text not null,
  duration_min    integer not null default 0,
  is_free_preview boolean not null default false,
  sort_order      integer not null default 0,
  bunny_video_id  text,                           -- ใส่ตอน Phase 3/4
  created_at      timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 4) orders : ออเดอร์ซื้อเดี่ยว (one-time)
-- -------------------------------------------------------------
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  product_id          uuid references public.products(id),
  amount_thb          integer not null,
  status              text not null default 'pending', -- 'pending' | 'paid' | 'failed'
  stripe_session_id   text,
  created_at          timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 5) entitlements : สิทธิ์เข้าถึงสินค้า (ซื้อเดี่ยว)
--    webhook ของ Stripe เท่านั้นที่เพิ่มแถวนี้ (Phase 4)
-- -------------------------------------------------------------
create table if not exists public.entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  source      text not null default 'purchase',   -- 'purchase' | 'manual'
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- -------------------------------------------------------------
-- 6) lesson_progress : ความคืบหน้าการเรียนรายบท
-- -------------------------------------------------------------
create table if not exists public.lesson_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   uuid not null references public.course_lessons(id) on delete cascade,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- -------------------------------------------------------------
-- 7) reviews : รีวิว (product_id = null คือรีวิวรวมหน้าแรก)
-- -------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references public.products(id) on delete cascade,
  student_name  text not null,
  school        text,
  rating        integer not null default 5,
  comment       text not null,
  is_featured   boolean not null default false,    -- โชว์หน้าแรก
  created_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 8) subscription_plans : แพ็กบุฟเฟต์รายเดือน (admin กำหนด)
-- -------------------------------------------------------------
create table if not exists public.subscription_plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                   -- 'ม.1 Package' / 'ม.4 Package'
  tier            text not null,                   -- 'M1' | 'M4'
  price_thb       integer not null,                -- ราคา/เดือน
  stripe_price_id text,                            -- Stripe Price ID
  description     text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 9) subscriptions : subscription ของแต่ละ user
-- -------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  plan_id                 uuid not null references public.subscription_plans(id),
  stripe_subscription_id  text unique,
  stripe_customer_id      text,
  status                  text not null,           -- 'active' | 'cancelled' | 'past_due' | 'unpaid'
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now()
);

-- =============================================================
-- Trigger: สร้างแถว profile อัตโนมัติเมื่อมีผู้สมัครใหม่
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================
alter table public.profiles            enable row level security;
alter table public.products            enable row level security;
alter table public.course_lessons      enable row level security;
alter table public.orders              enable row level security;
alter table public.entitlements        enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.reviews             enable row level security;
alter table public.subscription_plans  enable row level security;
alter table public.subscriptions       enable row level security;

-- helper: เช็คว่าเป็น admin ไหม (ใช้ใน policy)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- profiles ----------
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- ---------- products : ใครก็อ่าน published ได้ / admin จัดการได้ทั้งหมด ----------
drop policy if exists "products read published" on public.products;
create policy "products read published" on public.products
  for select using (status = 'published' or public.is_admin());

drop policy if exists "products admin all" on public.products;
create policy "products admin all" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- course_lessons : อ่านได้ถ้า product published / admin จัดการ ----------
drop policy if exists "lessons read" on public.course_lessons;
create policy "lessons read" on public.course_lessons
  for select using (
    exists (select 1 from public.products p
            where p.id = product_id and (p.status = 'published' or public.is_admin()))
  );

drop policy if exists "lessons admin all" on public.course_lessons;
create policy "lessons admin all" on public.course_lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- reviews : ใครก็อ่าน / admin จัดการ ----------
drop policy if exists "reviews read" on public.reviews;
create policy "reviews read" on public.reviews
  for select using (true);

drop policy if exists "reviews admin all" on public.reviews;
create policy "reviews admin all" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- subscription_plans : ใครก็อ่าน active / admin จัดการ ----------
drop policy if exists "plans read" on public.subscription_plans;
create policy "plans read" on public.subscription_plans
  for select using (is_active = true or public.is_admin());

drop policy if exists "plans admin all" on public.subscription_plans;
create policy "plans admin all" on public.subscription_plans
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- orders : อ่านของตัวเอง / admin อ่านทั้งหมด ----------
drop policy if exists "orders read own" on public.orders;
create policy "orders read own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

-- ---------- entitlements : อ่านของตัวเอง (เพิ่มผ่าน service_role/webhook เท่านั้น) ----------
drop policy if exists "entitlements read own" on public.entitlements;
create policy "entitlements read own" on public.entitlements
  for select using (auth.uid() = user_id or public.is_admin());

-- ---------- lesson_progress : เจ้าของจัดการของตัวเอง ----------
drop policy if exists "progress own all" on public.lesson_progress;
create policy "progress own all" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- subscriptions : อ่านของตัวเอง / admin อ่านทั้งหมด ----------
drop policy if exists "subs read own" on public.subscriptions;
create policy "subs read own" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

-- หมายเหตุ: การ "เขียน" entitlements / orders / subscriptions ทำผ่าน
-- service_role key (ฝั่ง server route / Stripe webhook) ซึ่งข้าม RLS อยู่แล้ว
-- จึงไม่ต้องสร้าง insert policy ให้ client
