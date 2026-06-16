import type { Metadata } from "next";
import Link from "next/link";
import { getActivePlans, getProductsByTier } from "@/lib/queries";
import { formatTHB } from "@/lib/types";
import SubscribeButton from "@/components/SubscribeButton";

export const metadata: Metadata = {
  title: "แพ็กบุฟเฟต์รายเดือน",
  description: "เปรียบเทียบแพ็กบุฟเฟต์ ม.1 และ ม.4 — ดูได้ทุกคอร์สและชีทในระดับนั้น",
};

export const dynamic = "force-dynamic";

const perks = [
  "ดูได้ทุกคอร์สวิดีโอในระดับนี้",
  "ดาวน์โหลดชีทสรุปทุกเล่มในระดับนี้",
  "เนื้อหาใหม่ที่เพิ่มเข้ามา ดูได้ทันที",
  "ยกเลิกได้ทุกเมื่อ ไม่มีสัญญาผูกมัด",
];

export default async function PlansPage() {
  const plans = await getActivePlans();

  // ดึงรายการสินค้าของแต่ละแพ็กเพื่อโชว์ว่าได้อะไรบ้าง
  const productsByTier: Record<string, { title: string; type: string }[]> = {};
  for (const plan of plans) {
    const items = await getProductsByTier(plan.tier);
    productsByTier[plan.id] = items.map((p) => ({ title: p.title, type: p.type }));
  }

  return (
    <div className="bg-brand-50/40">
      {/* หัวเรื่อง */}
      <section className="bg-brand-950">
        <div className="container-page py-16 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-accent-400">
            แพ็กบุฟเฟต์รายเดือน
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
            เรียนได้ไม่จำกัด ในราคาเดียว
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
            เลือกแพ็กตามระดับชั้นที่เตรียมสอบ ดูได้ทุกคอร์สและชีทในระดับนั้น
            ตราบที่ยังเป็นสมาชิก ยกเลิกได้ทุกเมื่อ
          </p>
        </div>
      </section>

      {/* ตารางราคา */}
      <section className="container-page -mt-10 pb-20">
        {plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-12 text-center text-brand-900/50">
            ยังไม่มีแพ็กบุฟเฟต์ — เพิ่มได้ในหน้า Admin หรือรัน <code>supabase_seed.sql</code>
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {plans.map((plan, idx) => {
              const highlight = plan.tier === "M4"; // เน้นแพ็ก ม.4 เป็น "ยอดนิยม"
              const items = productsByTier[plan.id] ?? [];
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl bg-white p-8 shadow-card ${
                    highlight ? "ring-2 ring-accent-500" : "border border-brand-100"
                  }`}
                >
                  {highlight && (
                    <span className="absolute -top-3 left-8 badge bg-accent-500 text-brand-950">
                      ยอดนิยม
                    </span>
                  )}
                  <h2 className="text-2xl font-extrabold text-brand-900">{plan.name}</h2>
                  <p className="mt-1 text-sm text-brand-900/60">{plan.description}</p>

                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-brand-800">
                      {formatTHB(plan.priceTHB)}
                    </span>
                    <span className="mb-2 text-brand-900/50">/ เดือน</span>
                  </div>

                  <div className="mt-6">
                    <SubscribeButton
                      planName={plan.name}
                      priceTHB={plan.priceTHB}
                      highlight={highlight}
                    />
                  </div>

                  <ul className="mt-7 space-y-3 text-sm text-brand-900/75">
                    {perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#1d4280" strokeWidth="2.2" className="mt-0.5 flex-none">
                          <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {items.length > 0 && (
                    <div className="mt-7 border-t border-brand-100 pt-5">
                      <p className="text-sm font-bold text-brand-900">
                        เนื้อหาที่ได้ในแพ็กนี้ ({items.length} รายการ)
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-brand-900/70">
                        {items.map((it) => (
                          <li key={it.title} className="flex items-center gap-2">
                            <span className="badge bg-brand-50 text-brand-600">
                              {it.type === "course" ? "คอร์ส" : "ชีท"}
                            </span>
                            {it.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-brand-900/55">
          อยากซื้อเป็นรายคอร์สแทน?{" "}
          <Link href="/courses" className="font-semibold text-brand-700 hover:underline">
            ดูคอร์สเดี่ยว
          </Link>{" "}
          ·{" "}
          <Link href="/sheets" className="font-semibold text-brand-700 hover:underline">
            ดูชีท
          </Link>
        </p>
      </section>
    </div>
  );
}
