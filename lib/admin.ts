import "server-only";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// =============================================================
// lib/admin.ts — ชั้นข้อมูลของหลังบ้าน (เรียกได้เฉพาะ admin)
// ใช้ service_role client (ข้าม RLS) เพื่ออ่านข้อมูลรวมของทุกคน
// ทุกฟังก์ชันควรเรียกหลัง requireAdmin() แล้ว
// =============================================================

// ตรวจว่าเป็น admin จริง ไม่ใช่ → เด้งออก
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/learn?error=admin-only");

  return { user, profile };
}

// ---------- helper: แผนที่ผู้ใช้ id → {email, fullName, createdAt} ----------
async function getUserMap(admin: ReturnType<typeof createAdminClient>) {
  const map = new Map<string, { email: string; fullName: string; createdAt: string }>();
  // ดึงผู้ใช้จากระบบ Auth (สูงสุด 1000 คน — พอสำหรับช่วงเริ่มต้น)
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const u of data?.users ?? []) {
    map.set(u.id, {
      email: u.email ?? "",
      fullName: (u.user_metadata?.full_name as string) || "",
      createdAt: u.created_at,
    });
  }
  return map;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

// =============================================================
// 1) ภาพรวมหน้า /admin
// =============================================================
export async function getDashboard() {
  const admin = createAdminClient();

  const [{ data: paidOrders }, { data: subs }, { count: studentCount }, { data: progress }] =
    await Promise.all([
      admin.from("orders").select("amount_thb, product_id, created_at, status").eq("status", "paid"),
      admin.from("subscriptions").select("status, current_period_end, subscription_plans(tier)"),
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("lesson_progress").select("user_id, updated_at").gte("updated_at", daysAgo(30).toISOString()),
    ]);

  const orders = paidOrders ?? [];
  const todayStart = startOfToday().getTime();
  const monthStart = startOfMonth().getTime();

  const revenueToday = orders
    .filter((o) => new Date(o.created_at).getTime() >= todayStart)
    .reduce((s, o) => s + (o.amount_thb ?? 0), 0);
  const revenueMonth = orders
    .filter((o) => new Date(o.created_at).getTime() >= monthStart)
    .reduce((s, o) => s + (o.amount_thb ?? 0), 0);

  // subscriber active แยก tier
  const isLive = (s: any) =>
    s.status === "active" &&
    (!s.current_period_end || new Date(s.current_period_end).getTime() > Date.now());
  let subM1 = 0,
    subM4 = 0;
  for (const s of subs ?? []) {
    if (!isLive(s)) continue;
    const tier = (s as any).subscription_plans?.tier;
    if (tier === "M1") subM1++;
    if (tier === "M4") subM4++;
  }

  const activeLearners = new Set((progress ?? []).map((p) => p.user_id)).size;

  // กราฟรายได้ 30 วัน
  const series: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000);
    day.setHours(0, 0, 0, 0);
    const next = day.getTime() + 86400000;
    const value = orders
      .filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= day.getTime() && t < next;
      })
      .reduce((s, o) => s + (o.amount_thb ?? 0), 0);
    series.push({
      label: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(day),
      value,
    });
  }

  // คอร์สขายดี Top 5 (นับจากออเดอร์ที่ชำระแล้ว)
  const byProduct = new Map<string, number>();
  for (const o of orders) {
    if (o.product_id) byProduct.set(o.product_id, (byProduct.get(o.product_id) ?? 0) + 1);
  }
  const { data: prodRows } = await admin.from("products").select("id, title");
  const titleMap = new Map((prodRows ?? []).map((p) => [p.id, p.title]));
  const topProducts = Array.from(byProduct.entries())
    .map(([id, count]) => ({ label: titleMap.get(id) ?? "—", value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // ออเดอร์ล่าสุด 10 + นักเรียนใหม่ 5
  const userMap = await getUserMap(admin);
  const { data: recentOrderRows } = await admin
    .from("orders")
    .select("id, amount_thb, status, created_at, product_id, user_id")
    .order("created_at", { ascending: false })
    .limit(10);
  const recentOrders = (recentOrderRows ?? []).map((o) => ({
    id: o.id,
    buyer: userMap.get(o.user_id)?.fullName || userMap.get(o.user_id)?.email || "—",
    product: titleMap.get(o.product_id ?? "") ?? "—",
    amount: o.amount_thb ?? 0,
    status: o.status,
    createdAt: o.created_at,
  }));

  const { data: newStudentRows } = await admin
    .from("profiles")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  const newStudents = (newStudentRows ?? []).map((p) => ({
    id: p.id,
    name: p.full_name || userMap.get(p.id)?.fullName || "—",
    email: userMap.get(p.id)?.email || "—",
    createdAt: p.created_at,
  }));

  return {
    revenueToday,
    revenueMonth,
    studentCount: studentCount ?? 0,
    activeLearners,
    subM1,
    subM4,
    series,
    topProducts,
    recentOrders,
    newStudents,
  };
}

// =============================================================
// 2) รายการสินค้า + จำนวนคนซื้อ/เรียน (หน้า /admin/products)
// =============================================================
export async function getAdminProducts() {
  const admin = createAdminClient();
  const [{ data: products }, { data: ents }, { data: lessons }, { data: progress }] =
    await Promise.all([
      admin.from("products").select("*").order("created_at", { ascending: false }),
      admin.from("entitlements").select("product_id, user_id"),
      admin.from("course_lessons").select("id, product_id"),
      admin.from("lesson_progress").select("user_id, lesson_id, completed"),
    ]);

  const lessonToProduct = new Map((lessons ?? []).map((l) => [l.id, l.product_id]));

  // ผู้ซื้อ (entitlements) ต่อ product
  const buyers = new Map<string, Set<string>>();
  for (const e of ents ?? []) {
    if (!buyers.has(e.product_id)) buyers.set(e.product_id, new Set());
    buyers.get(e.product_id)!.add(e.user_id);
  }

  // ผู้ที่มีความคืบหน้า (กำลังเรียน/เคยเปิด) ต่อ product
  const learners = new Map<string, Set<string>>();
  for (const p of progress ?? []) {
    const pid = lessonToProduct.get(p.lesson_id);
    if (!pid) continue;
    if (!learners.has(pid)) learners.set(pid, new Set());
    learners.get(pid)!.add(p.user_id);
  }

  return (products ?? []).map((p) => ({
    ...p,
    buyerCount: buyers.get(p.id)?.size ?? 0,
    learnerCount: learners.get(p.id)?.size ?? 0,
  }));
}

export async function getProductById(id: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*, course_lessons(*)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// =============================================================
// 3) บทเรียน + สถิติแต่ละบท (หน้า lessons)
// =============================================================
export async function getLessonsWithStats(productId: string) {
  const admin = createAdminClient();
  const [{ data: lessons }, { data: product }, { data: ents }, { data: progress }] =
    await Promise.all([
      admin.from("course_lessons").select("*").eq("product_id", productId).order("sort_order"),
      admin.from("products").select("id, title, type").eq("id", productId).maybeSingle(),
      admin.from("entitlements").select("user_id").eq("product_id", productId),
      admin
        .from("lesson_progress")
        .select("lesson_id, completed")
        .in(
          "lesson_id",
          (
            await admin.from("course_lessons").select("id").eq("product_id", productId)
          ).data?.map((l) => l.id) ?? ["00000000-0000-0000-0000-000000000000"]
        ),
    ]);

  const buyerCount = new Set((ents ?? []).map((e) => e.user_id)).size || 1;
  const completedByLesson = new Map<string, number>();
  for (const p of progress ?? []) {
    if (p.completed) completedByLesson.set(p.lesson_id, (completedByLesson.get(p.lesson_id) ?? 0) + 1);
  }

  const withStats = (lessons ?? []).map((l) => {
    const finished = completedByLesson.get(l.id) ?? 0;
    return {
      ...l,
      finishedCount: finished,
      finishedPct: Math.round((finished / buyerCount) * 100),
    };
  });

  return { product, lessons: withStats };
}

// =============================================================
// 4) วิเคราะห์ (หน้า /admin/analytics)
// =============================================================
export async function getAnalytics() {
  const admin = createAdminClient();
  const [{ data: products }, { data: ents }, { data: lessons }, { data: progress }, { data: views }] =
    await Promise.all([
      admin.from("products").select("id, title, type, status").eq("type", "course"),
      admin.from("entitlements").select("product_id, user_id, created_at"),
      admin.from("course_lessons").select("id, product_id, title, sort_order"),
      admin.from("lesson_progress").select("user_id, lesson_id, completed, updated_at"),
      admin.from("page_views").select("product_id, user_id"),
    ]);

  const lessonsByProduct = new Map<string, any[]>();
  for (const l of lessons ?? []) {
    if (!lessonsByProduct.has(l.product_id)) lessonsByProduct.set(l.product_id, []);
    lessonsByProduct.get(l.product_id)!.push(l);
  }
  const lessonToProduct = new Map((lessons ?? []).map((l) => [l.id, l.product_id]));

  // ผู้ซื้อ + ผู้เริ่มเรียน + ผู้เรียนจบ (ครบทุกบท) ต่อคอร์ส
  const buyers = new Map<string, Set<string>>();
  for (const e of ents ?? []) {
    if (!buyers.has(e.product_id)) buyers.set(e.product_id, new Set());
    buyers.get(e.product_id)!.add(e.user_id);
  }
  const started = new Map<string, Set<string>>();
  const completedCount = new Map<string, Map<string, number>>(); // product → user → จำนวนบทที่จบ
  for (const p of progress ?? []) {
    const pid = lessonToProduct.get(p.lesson_id);
    if (!pid) continue;
    if (!started.has(pid)) started.set(pid, new Set());
    started.get(pid)!.add(p.user_id);
    if (p.completed) {
      if (!completedCount.has(pid)) completedCount.set(pid, new Map());
      const m = completedCount.get(pid)!;
      m.set(p.user_id, (m.get(p.user_id) ?? 0) + 1);
    }
  }

  const courses = (products ?? []).map((c) => {
    const total = lessonsByProduct.get(c.id)?.length ?? 0;
    const buyerSet = buyers.get(c.id) ?? new Set();
    const startedSet = started.get(c.id) ?? new Set();
    const compMap = completedCount.get(c.id) ?? new Map();
    let finished = 0;
    for (const cnt of compMap.values()) if (total > 0 && cnt >= total) finished++;
    return {
      id: c.id,
      title: c.title,
      buyers: buyerSet.size,
      started: startedSet.size,
      finished,
      completionRate: buyerSet.size ? Math.round((finished / buyerSet.size) * 100) : 0,
    };
  });

  // drop-off รายบท (เรียงตามคอร์สแรกที่มีบท) — รวมทุกคอร์ส
  const completedByLesson = new Map<string, number>();
  for (const p of progress ?? []) {
    if (p.completed) completedByLesson.set(p.lesson_id, (completedByLesson.get(p.lesson_id) ?? 0) + 1);
  }

  // funnel รวมทั้งระบบ: เข้าชมหน้าสินค้า → ซื้อ (entitlements) → ชำระจริง (orders paid)
  const { data: paid } = await admin.from("orders").select("id").eq("status", "paid");
  const totalViews = (views ?? []).length;
  const totalBuyers = (ents ?? []).length;
  const totalPaid = (paid ?? []).length;

  // retention: ผู้ซื้อที่กลับมาเรียนใน 7/14/30 วันหลังซื้อ
  const firstBuy = new Map<string, number>(); // user → เวลาแรกที่ซื้อ
  for (const e of ents ?? []) {
    const t = new Date(e.created_at).getTime();
    if (!firstBuy.has(e.user_id) || t < firstBuy.get(e.user_id)!) firstBuy.set(e.user_id, t);
  }
  const activityByUser = new Map<string, number[]>();
  for (const p of progress ?? []) {
    if (!activityByUser.has(p.user_id)) activityByUser.set(p.user_id, []);
    activityByUser.get(p.user_id)!.push(new Date(p.updated_at).getTime());
  }
  const buyersList = Array.from(firstBuy.keys());
  const retention = [7, 14, 30].map((win) => {
    let came = 0;
    for (const u of buyersList) {
      const t0 = firstBuy.get(u)!;
      const acts = activityByUser.get(u) ?? [];
      if (acts.some((t) => t > t0 && t <= t0 + win * 86400000)) came++;
    }
    return {
      window: win,
      pct: buyersList.length ? Math.round((came / buyersList.length) * 100) : 0,
      count: came,
    };
  });

  return {
    courses,
    funnel: [
      { label: "เข้าชมหน้าสินค้า", value: totalViews },
      { label: "ปลดล็อกสิทธิ์ (ซื้อ)", value: totalBuyers },
      { label: "ชำระเงินจริง", value: totalPaid },
    ],
    retention,
    totalBuyers: buyersList.length,
  };
}

// =============================================================
// 5) นักเรียน (หน้า /admin/students)
// =============================================================
export async function getStudents() {
  const admin = createAdminClient();
  const userMap = await getUserMap(admin);
  const [{ data: profiles }, { data: ents }, { data: subs }] = await Promise.all([
    admin.from("profiles").select("id, full_name, role, created_at"),
    admin.from("entitlements").select("user_id"),
    admin.from("subscriptions").select("user_id, status, subscription_plans(tier)"),
  ]);

  const purchaseCount = new Map<string, number>();
  for (const e of ents ?? []) purchaseCount.set(e.user_id, (purchaseCount.get(e.user_id) ?? 0) + 1);
  const subByUser = new Map<string, string>();
  for (const s of subs ?? []) {
    if (s.status === "active") {
      const tier = (s as any).subscription_plans?.tier;
      if (tier) subByUser.set(s.user_id, tier);
    }
  }

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      name: p.full_name || userMap.get(p.id)?.fullName || "—",
      email: userMap.get(p.id)?.email || "—",
      role: p.role,
      createdAt: p.created_at,
      purchases: purchaseCount.get(p.id) ?? 0,
      subTier: subByUser.get(p.id) ?? null,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getStudentDetail(userId: string) {
  const admin = createAdminClient();
  const userMap = await getUserMap(admin);
  const info = userMap.get(userId);

  const [{ data: profile }, { data: ents }, { data: products }, { data: lessons }, { data: progress }, { data: sub }] =
    await Promise.all([
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      admin.from("entitlements").select("product_id, created_at, source").eq("user_id", userId),
      admin.from("products").select("id, title, type"),
      admin.from("course_lessons").select("id, product_id"),
      admin.from("lesson_progress").select("lesson_id, completed").eq("user_id", userId),
      admin
        .from("subscriptions")
        .select("status, current_period_end, subscription_plans(name, tier)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const lessonsByProduct = new Map<string, string[]>();
  for (const l of lessons ?? []) {
    if (!lessonsByProduct.has(l.product_id)) lessonsByProduct.set(l.product_id, []);
    lessonsByProduct.get(l.product_id)!.push(l.id);
  }
  const completedLessons = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

  const purchases = (ents ?? []).map((e) => {
    const prod = productMap.get(e.product_id);
    const total = lessonsByProduct.get(e.product_id)?.length ?? 0;
    const done = (lessonsByProduct.get(e.product_id) ?? []).filter((id) => completedLessons.has(id)).length;
    return {
      title: prod?.title ?? "—",
      type: prod?.type ?? "course",
      source: e.source,
      createdAt: e.created_at,
      progressPct: total ? Math.round((done / total) * 100) : 0,
    };
  });

  return {
    name: profile?.full_name || info?.fullName || "—",
    email: info?.email || "—",
    createdAt: info?.createdAt || profile?.created_at,
    purchases,
    subscription: sub
      ? {
          name: (sub as any).subscription_plans?.name ?? "",
          tier: (sub as any).subscription_plans?.tier ?? "",
          status: sub.status,
          end: sub.current_period_end,
        }
      : null,
  };
}

// =============================================================
// 6) แพ็กบุฟเฟต์ (หน้า /admin/plans)
// =============================================================
export async function getAdminPlans() {
  const admin = createAdminClient();
  const [{ data: plans }, { data: subs }, { data: products }] = await Promise.all([
    admin.from("subscription_plans").select("*").order("price_thb"),
    admin.from("subscriptions").select("plan_id, status, subscription_plans(tier, price_thb)"),
    admin.from("products").select("id, title, type, tier, status"),
  ]);

  return (plans ?? []).map((plan) => {
    const activeSubs = (subs ?? []).filter(
      (s) => s.plan_id === plan.id && s.status === "active"
    );
    const items = (products ?? []).filter(
      (p) => p.tier === plan.tier || p.tier === "both"
    );
    return {
      ...plan,
      subscriberCount: activeSubs.length,
      monthlyRevenue: activeSubs.length * (plan.price_thb ?? 0),
      items,
    };
  });
}

// รายการสินค้าทั้งหมด (ใช้จับคู่ tier ในหน้า plans)
export async function getAllProductsLite() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("id, title, type, tier, level, status")
    .order("title");
  return data ?? [];
}

// =============================================================
// 7) ออเดอร์ (หน้า /admin/orders)
// =============================================================
export async function getOrders() {
  const admin = createAdminClient();
  const userMap = await getUserMap(admin);
  const [{ data: orders }, { data: products }] = await Promise.all([
    admin.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
    admin.from("products").select("id, title, type"),
  ]);
  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  return (orders ?? []).map((o) => ({
    id: o.id,
    buyer: userMap.get(o.user_id)?.fullName || userMap.get(o.user_id)?.email || "—",
    email: userMap.get(o.user_id)?.email || "—",
    product: productMap.get(o.product_id ?? "")?.title ?? "—",
    productType: productMap.get(o.product_id ?? "")?.type ?? "—",
    amount: o.amount_thb ?? 0,
    method: o.payment_method ?? "—",
    status: o.status,
    createdAt: o.created_at,
  }));
}

// =============================================================
// 8) รีวิว (หน้า /admin/reviews)
// =============================================================
export async function getAdminReviews() {
  const admin = createAdminClient();
  const [{ data: reviews }, { data: products }] = await Promise.all([
    admin.from("reviews").select("*").order("created_at", { ascending: false }),
    admin.from("products").select("id, title"),
  ]);
  const productMap = new Map((products ?? []).map((p) => [p.id, p.title]));

  return (reviews ?? []).map((r) => ({
    id: r.id,
    studentName: r.student_name,
    school: r.school,
    rating: r.rating,
    comment: r.comment,
    productTitle: r.product_id ? productMap.get(r.product_id) ?? "—" : "รีวิวรวม (หน้าแรก)",
    imageUrl: r.image_url ?? null,
    resultLabel: r.result_label ?? null,
    isVisible: r.is_visible ?? true,
    isFeatured: r.is_featured ?? false,
    createdAt: r.created_at,
  }));
}

// =============================================================
// 10) ตั้งค่าเว็บ + ผู้สอน (หน้า /admin/settings)
// =============================================================
export async function getSettingsAdmin(): Promise<Record<string, string>> {
  const admin = createAdminClient();
  const { data } = await admin.from("site_settings").select("key, value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  return map;
}

export async function getAllInstructors() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("instructors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    title: r.title ?? "",
    bio: r.bio ?? "",
    imageUrl: r.image_url ?? null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    sortOrder: r.sort_order ?? 0,
    isActive: r.is_active ?? true,
  }));
}

// =============================================================
// 9) ผลงานนักเรียน (หน้า /admin/portfolio)
// =============================================================
export async function getAdminPortfolio() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("portfolio_posts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => ({
    id: p.id,
    imageUrl: p.image_url,
    caption: p.caption ?? "",
    studentName: p.student_name ?? "",
    resultLabel: p.result_label ?? "",
    productId: p.product_id ?? null,
    sortOrder: p.sort_order ?? 0,
    isPublished: p.is_published ?? true,
  }));
}
