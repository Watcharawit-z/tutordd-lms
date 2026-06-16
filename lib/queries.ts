import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  Lesson,
  Review,
  ProductType,
  SubscriptionPlan,
  UserSubscription,
  PortfolioPost,
  Instructor,
  SiteSettings,
  Tier,
} from "@/lib/types";

// =============================================================
// ชั้นเข้าถึงข้อมูล (Data Access) — ดึงจาก Supabase แล้ว map เป็น type ฝั่ง UI
// ทุก query ใช้ server client (อยู่ใน Server Component / Server Action เท่านั้น)
// =============================================================

/* ---------- mappers: DB row (snake_case) -> type (camelCase) ---------- */

function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    title: row.title,
    durationMin: row.duration_min ?? 0,
    isFreePreview: row.is_free_preview ?? false,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as ProductType,
    status: row.status,
    title: row.title,
    subject: row.subject,
    level: row.level,
    shortDesc: row.short_desc ?? "",
    description: row.description ?? "",
    priceTHB: row.price_thb ?? 0,
    oldPriceTHB: row.old_price_thb ?? null,
    coverColor: row.cover_color ?? "#1d4280",
    pages: row.pages ?? null,
    tier: (row.tier ?? null) as Tier,
    featured: row.featured ?? false,
    lessons: Array.isArray(row.course_lessons)
      ? row.course_lessons.map(mapLesson).sort((a: Lesson, b: Lesson) => a.sortOrder - b.sortOrder)
      : [],
  };
}

function mapReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id ?? null,
    studentName: row.student_name,
    school: row.school ?? null,
    rating: row.rating ?? 5,
    comment: row.comment,
    imageUrl: row.image_url ?? null,
    resultLabel: row.result_label ?? null,
  };
}

/* ---------- products ---------- */

// รายการสินค้าที่ published (กรองตามชนิดได้)
export async function getPublishedProducts(type?: ProductType): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*, course_lessons(*)")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) {
    console.error("getPublishedProducts:", error.message);
    return [];
  }
  return (data ?? []).map(mapProduct);
}

// คอร์สเด่นสำหรับหน้าแรก
export async function getFeaturedCourses(limit = 3): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, course_lessons(*)")
    .eq("status", "published")
    .eq("type", "course")
    .eq("featured", true)
    .limit(limit);

  if (error) {
    console.error("getFeaturedCourses:", error.message);
    return [];
  }
  return (data ?? []).map(mapProduct);
}

// สินค้าตาม slug (สำหรับหน้ารายละเอียด)
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, course_lessons(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug:", error.message);
    return null;
  }
  return data ? mapProduct(data) : null;
}

// สินค้าที่อยู่ในแพ็ก tier หนึ่ง ๆ (ใช้หน้า /plans) — รวม 'both' ด้วย
export async function getProductsByTier(tier: "M1" | "M4"): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, course_lessons(*)")
    .eq("status", "published")
    .in("tier", [tier, "both"]);

  if (error) {
    console.error("getProductsByTier:", error.message);
    return [];
  }
  return (data ?? []).map(mapProduct);
}

/* ---------- reviews ---------- */

// รีวิวเด่นหน้าแรก
export async function getFeaturedReviews(): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_featured", true)
    .eq("is_visible", true)
    .limit(6);

  if (error) {
    console.error("getFeaturedReviews:", error.message);
    return [];
  }
  return (data ?? []).map(mapReview);
}

// รีวิวของสินค้าชิ้นหนึ่ง (ถ้าไม่มี ใช้รีวิวเด่นแทน)
export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_visible", true);

  if (data && data.length > 0) return data.map(mapReview);
  return getFeaturedReviews();
}

/* ---------- subscription plans ---------- */

function mapPlan(row: any): SubscriptionPlan {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    priceTHB: row.price_thb,
    stripePriceId: row.stripe_price_id ?? null,
    description: row.description ?? null,
    isActive: row.is_active,
  };
}

// แพ็กบุฟเฟต์ที่เปิดขายอยู่
export async function getActivePlans(): Promise<SubscriptionPlan[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_thb", { ascending: true });

  if (error) {
    console.error("getActivePlans:", error.message);
    return [];
  }
  return (data ?? []).map(mapPlan);
}

/* ---------- subscription ของ user ปัจจุบัน ---------- */

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, subscription_plans(name, tier)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    planId: data.plan_id,
    planName: data.subscription_plans?.name ?? "",
    tier: data.subscription_plans?.tier ?? "M1",
    status: data.status,
    currentPeriodEnd: data.current_period_end ?? null,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  };
}

/* ---------- ผลงานนักเรียน (portfolio) ---------- */

function mapPortfolio(row: any): PortfolioPost {
  return {
    id: row.id,
    imageUrl: row.image_url,
    caption: row.caption ?? null,
    studentName: row.student_name ?? null,
    resultLabel: row.result_label ?? null,
    productId: row.product_id ?? null,
    sortOrder: row.sort_order ?? 0,
    isPublished: row.is_published ?? true,
  };
}

// รูปผลงานที่เผยแพร่ (หน้า /portfolio)
export async function getPublishedPortfolio(): Promise<PortfolioPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("portfolio_posts")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedPortfolio:", error.message);
    return [];
  }
  return (data ?? []).map(mapPortfolio);
}

/* ---------- ตั้งค่าเว็บ + ผู้สอน ---------- */

// อ่านค่าตั้งค่าทั้งหมดเป็น object { key: value }
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) {
    console.error("getSiteSettings:", error.message);
    return {};
  }
  const map: SiteSettings = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  return map;
}

// helper: อ่านค่าจาก settings พร้อม fallback
export function getSetting(settings: SiteSettings, key: string, fallback = ""): string {
  const v = settings[key];
  return v && v.trim() !== "" ? v : fallback;
}

function mapInstructor(row: any): Instructor {
  return {
    id: row.id,
    name: row.name,
    title: row.title ?? null,
    bio: row.bio ?? null,
    imageUrl: row.image_url ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? true,
  };
}

// ผู้สอนที่เปิดแสดง (หน้าแรก) เรียงตาม sort_order
export async function getActiveInstructors(): Promise<Instructor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("instructors")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getActiveInstructors:", error.message);
    return [];
  }
  return (data ?? []).map(mapInstructor);
}
