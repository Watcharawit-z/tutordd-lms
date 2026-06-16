import { createBrowserClient } from "@supabase/ssr";

// Supabase client สำหรับฝั่ง browser (Client Components)
// ใช้ anon key เท่านั้น — ปลอดภัยที่จะอยู่ฝั่ง client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
