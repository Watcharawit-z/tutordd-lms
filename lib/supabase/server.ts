import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client สำหรับฝั่ง server (Server Components / Server Actions / Route Handlers)
// อ่าน/เขียน session ผ่าน cookies ของ Next.js
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // ใน Server Component การ set cookie จะถูกบล็อก — ครอบ try/catch ไว้
          // middleware เป็นตัวรีเฟรช session อยู่แล้ว
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );
}

// client ที่ใช้ service_role key — "ฝั่ง server เท่านั้น" ข้าม RLS
// ใช้ใน webhook / route ที่ต้องเขียน entitlements, subscriptions (Phase 4)
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
