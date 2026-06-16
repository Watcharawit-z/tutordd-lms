import { createClient } from "@/lib/supabase/server";
import type { Product, Tier } from "@/lib/types";

// =============================================================
// lib/access.ts — หัวใจการเช็คสิทธิ์ (ฝั่ง server เท่านั้น)
// รวม 2 โหมดในฟังก์ชันเดียว:
//   1) ซื้อเดี่ยว  → มีแถวใน entitlements
//   2) บุฟเฟต์    → มี subscription ที่ active + tier ตรงกับ product.tier
// =============================================================

// subscription จะปลดล็อกสินค้าได้ก็ต่อเมื่อ tier ตรงกัน
// product.tier = 'both' เข้าถึงได้ทั้งแพ็ก ม.1 และ ม.4
function tierMatches(productTier: Tier, planTier: "M1" | "M4"): boolean {
  if (productTier === "both") return true;
  return productTier === planTier;
}

// subscription ยัง active อยู่ไหม (เช็คทั้ง status และวันหมดอายุ)
function isSubscriptionLive(status: string, periodEnd: string | null): boolean {
  if (status !== "active") return false;
  if (!periodEnd) return true;
  return new Date(periodEnd).getTime() > Date.now();
}

/**
 * เช็คว่า user มีสิทธิ์เข้าถึงสินค้าชิ้นนี้ไหม
 * @param userId  id ของผู้ใช้ (จาก auth.getUser())
 * @param product สินค้า (ต้องมี id และ tier)
 */
export async function hasAccess(
  userId: string,
  product: Pick<Product, "id" | "tier">
): Promise<boolean> {
  const supabase = createClient();

  // 1) ซื้อเดี่ยว — มี entitlement ตรง ๆ
  const { data: ent } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", product.id)
    .maybeSingle();

  if (ent) return true;

  // 2) บุฟเฟต์ — subscription active + tier ตรง
  if (product.tier) {
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, subscription_plans(tier)")
      .eq("user_id", userId)
      .eq("status", "active");

    for (const s of subs ?? []) {
      const planTier = (s as any).subscription_plans?.tier as
        | "M1"
        | "M4"
        | undefined;
      if (
        planTier &&
        isSubscriptionLive(s.status, s.current_period_end) &&
        tierMatches(product.tier, planTier)
      ) {
        return true;
      }
    }
  }

  return false;
}

// ดึง id ของสินค้าทั้งหมดที่ user เข้าถึงได้ (ใช้หน้า /learn)
export async function getAccessibleProductIds(userId: string): Promise<{
  purchased: Set<string>;
  viaSubscriptionTiers: ("M1" | "M4")[];
}> {
  const supabase = createClient();

  const { data: ents } = await supabase
    .from("entitlements")
    .select("product_id")
    .eq("user_id", userId);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, subscription_plans(tier)")
    .eq("user_id", userId)
    .eq("status", "active");

  const tiers: ("M1" | "M4")[] = [];
  for (const s of subs ?? []) {
    const planTier = (s as any).subscription_plans?.tier as "M1" | "M4" | undefined;
    if (planTier && isSubscriptionLive(s.status, s.current_period_end)) {
      tiers.push(planTier);
    }
  }

  return {
    purchased: new Set((ents ?? []).map((e) => e.product_id)),
    viaSubscriptionTiers: tiers,
  };
}
