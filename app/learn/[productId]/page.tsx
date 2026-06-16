import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

// Player / หน้าดาวน์โหลด — Phase 2 ตรวจสิทธิ์ฝั่ง server แล้ว
// ส่วนเล่นวิดีโอ (Bunny signed URL) + ดาวน์โหลดชีท (Supabase signed URL) อยู่ Phase 4
export default async function PlayerPage({
  params,
}: {
  params: { productId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/learn/${params.productId}`);

  // ดึงสินค้า + บทเรียน
  const { data: product } = await supabase
    .from("products")
    .select("*, course_lessons(*)")
    .eq("id", params.productId)
    .maybeSingle();

  if (!product) notFound();

  // ⛔️ เช็คสิทธิ์ฝั่ง server เสมอ — ไม่มีสิทธิ์ ห้ามเข้า
  const allowed = await hasAccess(user.id, {
    id: product.id,
    tier: (product.tier ?? null) as any,
  });
  if (!allowed) {
    redirect(`/product/${product.slug}?error=no-access`);
  }

  const lessons = (product.course_lessons ?? []).sort(
    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const isCourse = product.type === "course";

  return (
    <div className="container-page py-10">
      <Link href="/learn" className="text-sm text-brand-700 hover:underline">
        ← กลับคอร์สของฉัน
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-extrabold text-brand-900">{product.title}</h1>

          {/* กล่อง player (placeholder) */}
          <div className="mt-5 flex aspect-video items-center justify-center rounded-2xl bg-brand-950 text-center text-brand-100">
            <div>
              <p className="text-lg font-semibold text-white">
                {isCourse ? "เครื่องเล่นวิดีโอ" : "ตัวอ่าน/ดาวน์โหลดชีท"}
              </p>
              <p className="mt-2 text-sm text-brand-300">
                จะเชื่อมต่อ {isCourse ? "Bunny.net (signed URL)" : "Supabase Storage (signed URL)"} ใน Phase 4
              </p>
            </div>
          </div>
        </div>

        {/* รายการบท */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
            <p className="font-bold text-brand-900">
              {isCourse ? "บทเรียน" : "เนื้อหา"} ({lessons.length})
            </p>
            <ul className="mt-3 space-y-1">
              {lessons.map((l: any, i: number) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-brand-50"
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-brand-900/80">{l.title}</span>
                  {l.duration_min > 0 && (
                    <span className="text-xs text-brand-900/40">{l.duration_min} น.</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
