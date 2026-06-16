import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getReviewsForProduct } from "@/lib/queries";
import { hasAccess } from "@/lib/access";
import { recordPageView } from "@/lib/track";
import { createClient } from "@/lib/supabase/server";
import { formatTHB, tierLabel } from "@/lib/types";
import ProductCover from "@/components/ProductCover";
import StarRating from "@/components/StarRating";
import BuyButton from "@/components/BuyButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "ไม่พบสินค้า" };
  return { title: product.title, description: product.shortDesc };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const reviews = await getReviewsForProduct(product.id);

  // เช็คว่าผู้ใช้ปัจจุบันมีสิทธิ์เข้าถึงสินค้านี้แล้วหรือยัง (ซื้อเดี่ยว/บุฟเฟต์)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const owned = user ? await hasAccess(user.id, product) : false;

  // แทร็กการเข้าชมหน้าสินค้า (สำหรับ funnel/analytics ในหลังบ้าน)
  await recordPageView(product.id, user?.id ?? null);

  const isCourse = product.type === "course";
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 5;
  const totalMinutes = product.lessons.reduce((s, l) => s + l.durationMin, 0);
  const tier = tierLabel(product.tier);

  return (
    <div className="bg-brand-50/40">
      <div className="container-page pt-6 text-sm text-brand-900/50">
        <Link href="/" className="hover:text-brand-700">หน้าแรก</Link>
        <span className="mx-1">/</span>
        <Link href={isCourse ? "/courses" : "/sheets"} className="hover:text-brand-700">
          {isCourse ? "คอร์สออนไลน์" : "ชีทสรุป"}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-brand-900/80">{product.title}</span>
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-3">
        {/* เนื้อหาหลัก */}
        <div className="lg:col-span-2">
          <ProductCover product={product} className="h-56 rounded-2xl sm:h-72" />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="badge bg-brand-100 text-brand-700">{product.subject}</span>
            <span className="badge bg-brand-100 text-brand-700">{product.level}</span>
            {tier && <span className="badge bg-accent-500/15 text-accent-600">{tier}</span>}
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} />
              <span className="text-sm text-brand-900/60">
                {avgRating.toFixed(1)} ({reviews.length} รีวิว)
              </span>
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-brand-900 sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-brand-900/70">{product.description}</p>

          {/* สารบัญ */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-900">
                {isCourse ? "สารบัญบทเรียน" : "ตัวอย่างเนื้อหา"}
              </h2>
              {isCourse && product.lessons.length > 0 && (
                <span className="text-sm text-brand-900/50">
                  {product.lessons.length} บท · รวม {Math.round((totalMinutes / 60) * 10) / 10} ชม.
                </span>
              )}
            </div>

            <ul className="mt-4 divide-y divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white">
              {product.lessons.map((lesson, idx) => (
                <li key={lesson.id} className="flex items-center gap-4 p-4">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-900">{lesson.title}</p>
                    {isCourse && lesson.durationMin > 0 && (
                      <p className="text-xs text-brand-900/50">{lesson.durationMin} นาที</p>
                    )}
                  </div>
                  {lesson.isFreePreview ? (
                    <span className="badge bg-accent-500/15 text-accent-600">ดูฟรี</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#84ade1" strokeWidth="1.8" aria-label="ต้องซื้อก่อน">
                      <rect x="4" y="9" width="12" height="8" rx="1.5" />
                      <path d="M7 9V7a3 3 0 016 0v2" strokeLinecap="round" />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* รีวิว */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-brand-900">รีวิวจากผู้เรียน</h2>
            <div className="mt-4 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-brand-100 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-brand-900">{r.studentName}</div>
                      <div className="text-sm text-brand-700">{r.school}</div>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.resultLabel && (
                    <span className="badge mt-2 bg-accent-500/15 text-accent-600">{r.resultLabel}</span>
                  )}
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrl} alt="" className="mt-3 max-h-60 rounded-xl object-cover" />
                  )}
                  <p className="mt-3 leading-relaxed text-brand-900/80">“{r.comment}”</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* กล่องราคา */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-3xl border border-brand-100 bg-white p-7 shadow-card">
            {owned ? (
              <>
                <p className="badge bg-green-100 text-green-700">คุณมีสิทธิ์เข้าถึงแล้ว</p>
                <Link href="/learn" className="btn-accent mt-5 w-full text-base">
                  {isCourse ? "เข้าเรียน" : "ไปดาวน์โหลด"}
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-brand-800">
                    {formatTHB(product.priceTHB)}
                  </span>
                  {product.oldPriceTHB && (
                    <span className="mb-1 text-base text-brand-300 line-through">
                      {formatTHB(product.oldPriceTHB)}
                    </span>
                  )}
                </div>
                {product.oldPriceTHB && (
                  <p className="mt-1 text-sm font-semibold text-accent-600">
                    ประหยัด {formatTHB(product.oldPriceTHB - product.priceTHB)}
                  </p>
                )}
                <BuyButton product={product} />
                {tier && (
                  <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
                    หรือสมัคร{" "}
                    <Link href="/plans" className="font-semibold underline">
                      แพ็กบุฟเฟต์
                    </Link>{" "}
                    เพื่อดูสินค้านี้และอีกหลายตัวในระดับเดียวกัน
                  </p>
                )}
              </>
            )}

            <ul className="mt-6 space-y-3 text-sm text-brand-900/70">
              {(isCourse
                ? ["เข้าดูวิดีโอในเว็บได้ทันที", "เรียนซ้ำได้ไม่จำกัด", "ติดตามความคืบหน้ารายบท"]
                : ["ดาวน์โหลดไฟล์ PDF ได้ทันที", `${product.pages ?? "-"} หน้า เนื้อหา + เฉลย`, "ลิงก์ดาวน์โหลดปลอดภัย"]
              ).map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#1d4280" strokeWidth="2.2" className="mt-0.5 flex-none">
                    <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-brand-100 pt-4 text-xs text-brand-900/40">
              ชำระผ่าน PromptPay หรือบัตรเครดิต ปลอดภัยด้วยระบบ Stripe
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
