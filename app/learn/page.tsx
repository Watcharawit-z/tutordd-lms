import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedProducts, getUserSubscription } from "@/lib/queries";
import { getAccessibleProductIds } from "@/lib/access";
import ProductCover from "@/components/ProductCover";

export const metadata: Metadata = { title: "คอร์สของฉัน" };
export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/learn");

  const [products, access, subscription] = await Promise.all([
    getPublishedProducts(),
    getAccessibleProductIds(user.id),
    getUserSubscription(user.id),
  ]);

  // สินค้าที่เข้าถึงได้ = ซื้อเดี่ยว หรือได้จาก subscription (tier ตรง)
  const myProducts = products
    .map((p) => {
      const purchased = access.purchased.has(p.id);
      const viaSub =
        !!p.tier &&
        (p.tier === "both"
          ? access.viaSubscriptionTiers.length > 0
          : access.viaSubscriptionTiers.includes(p.tier as "M1" | "M4"));
      return { product: p, purchased, viaSub, hasAccess: purchased || viaSub };
    })
    .filter((x) => x.hasAccess);

  const subActive = subscription?.status === "active";

  return (
    <div className="container-page py-14">
      <h1 className="section-title">คอร์สของฉัน</h1>
      <p className="mt-2 text-brand-900/60">คอร์สและชีททั้งหมดที่คุณมีสิทธิ์เข้าถึง</p>

      {/* แถบสถานะ subscription */}
      {subscription && (
        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-brand-100 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-brand-900">
              แพ็กบุฟเฟต์: {subscription.planName}{" "}
              <span
                className={`badge ml-2 ${
                  subActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {subActive ? "ใช้งานอยู่" : subscription.status}
              </span>
            </p>
            {subscription.currentPeriodEnd && (
              <p className="mt-1 text-sm text-brand-900/55">
                {subscription.cancelAtPeriodEnd ? "สิ้นสุดสิทธิ์วันที่ " : "ต่ออายุถัดไปวันที่ "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <Link href="/account/subscription" className="btn-ghost">
            จัดการแพ็ก
          </Link>
        </div>
      )}

      {myProducts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <p className="text-brand-900/60">ยังไม่มีคอร์สหรือชีทที่เข้าถึงได้</p>
          <p className="mt-1 text-sm text-brand-900/40">
            ซื้อคอร์สเดี่ยว หรือสมัครแพ็กบุฟเฟต์เพื่อเริ่มเรียน
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/courses" className="btn-primary">เลือกคอร์ส</Link>
            <Link href="/plans" className="btn-ghost">ดูแพ็กบุฟเฟต์</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myProducts.map(({ product, purchased, viaSub }) => {
            const isCourse = product.type === "course";
            return (
              <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card">
                <ProductCover product={product} className="h-36" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-2">
                    {purchased && <span className="badge bg-green-100 text-green-700">ซื้อแล้ว</span>}
                    {viaSub && !purchased && (
                      <span className="badge bg-accent-500/15 text-accent-600">จากแพ็กบุฟเฟต์</span>
                    )}
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-bold text-brand-900">{product.title}</h3>
                  <div className="mt-auto pt-4">
                    <Link href={`/learn/${product.id}`} className="btn-accent w-full">
                      {isCourse ? "เข้าเรียน" : "ดาวน์โหลด"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
