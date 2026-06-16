import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

// บันทึกการเข้าชมหน้าสินค้า (ใช้ทำ funnel/analytics)
// เขียนผ่าน service_role (ข้าม RLS) — เรียกจาก Server Component ของหน้าสินค้า
export async function recordPageView(productId: string, userId: string | null) {
  try {
    const admin = createAdminClient();
    await admin.from("page_views").insert({
      product_id: productId,
      user_id: userId,
    });
  } catch {
    // ไม่ให้ล้มทั้งหน้าเพราะแทร็กไม่สำเร็จ
  }
}
