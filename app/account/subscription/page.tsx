import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/queries";
import ManageSubscriptionButton from "./ManageSubscriptionButton";

export const metadata: Metadata = { title: "จัดการแพ็กสมาชิก" };
export const dynamic = "force-dynamic";

const statusLabel: Record<string, { text: string; cls: string }> = {
  active: { text: "ใช้งานอยู่", cls: "bg-green-100 text-green-700" },
  cancelled: { text: "ยกเลิกแล้ว", cls: "bg-brand-100 text-brand-700" },
  past_due: { text: "ค้างชำระ", cls: "bg-amber-100 text-amber-700" },
  unpaid: { text: "ยังไม่ชำระ", cls: "bg-red-100 text-red-700" },
};

export default async function SubscriptionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/subscription");

  const subscription = await getUserSubscription(user.id);

  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="section-title">จัดการแพ็กสมาชิก</h1>
      <p className="mt-2 text-brand-900/60">ดูสถานะแพ็กบุฟเฟต์ ต่ออายุ หรือยกเลิก</p>

      {!subscription ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center">
          <p className="text-brand-900/60">คุณยังไม่ได้สมัครแพ็กบุฟเฟต์</p>
          <Link href="/plans" className="btn-primary mt-5">ดูแพ็กบุฟเฟต์</Link>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-8 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-900/50">แพ็กปัจจุบัน</p>
              <p className="text-2xl font-extrabold text-brand-900">{subscription.planName}</p>
            </div>
            <span className={`badge ${statusLabel[subscription.status]?.cls ?? "bg-brand-100 text-brand-700"}`}>
              {statusLabel[subscription.status]?.text ?? subscription.status}
            </span>
          </div>

          <dl className="mt-6 space-y-3 border-t border-brand-100 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-900/55">ระดับ</dt>
              <dd className="font-semibold text-brand-900">{subscription.tier}</dd>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex justify-between">
                <dt className="text-brand-900/55">
                  {subscription.cancelAtPeriodEnd ? "สิ้นสุดสิทธิ์" : "ต่ออายุถัดไป"}
                </dt>
                <dd className="font-semibold text-brand-900">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            )}
            {subscription.cancelAtPeriodEnd && (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
                แพ็กนี้ถูกตั้งให้ยกเลิกเมื่อสิ้นรอบบิล — ยังเข้าเรียนได้จนถึงวันสิ้นสุดสิทธิ์
              </p>
            )}
          </dl>

          <div className="mt-6">
            <ManageSubscriptionButton />
            <p className="mt-3 text-xs text-brand-900/40">
              การยกเลิก/เปลี่ยนแพ็กทำผ่าน Stripe Customer Portal (เปิดใช้งานใน Phase 4)
            </p>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm">
        <Link href="/learn" className="text-brand-700 hover:underline">← กลับคอร์สของฉัน</Link>
      </p>
    </div>
  );
}
