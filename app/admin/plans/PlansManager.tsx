"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { thb } from "@/lib/format";
import { useToast } from "@/components/admin/Toast";
import { savePlan, setProductTier } from "../actions";

type Plan = {
  id: string;
  name: string;
  tier: string;
  price_thb: number;
  description: string | null;
  subscriberCount: number;
  monthlyRevenue: number;
  items: { id: string; title: string; type: string }[];
};
type Product = { id: string; title: string; type: string; tier: string | null; level: string; status: string };

const inputCls =
  "mt-1 w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function PlanCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const { show } = useToast();
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await savePlan(formData);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <span className="badge bg-brand-100 text-brand-700">แพ็ก {plan.tier}</span>
        <div className="text-right">
          <p className="text-sm text-brand-900/55">สมาชิกที่ใช้งานอยู่</p>
          <p className="text-2xl font-extrabold text-brand-700">{plan.subscriberCount} คน</p>
        </div>
      </div>

      <form action={submit} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={plan.id} />
        <div>
          <label className="block text-sm font-semibold text-brand-900">ชื่อแพ็ก</label>
          <input name="name" defaultValue={plan.name} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-900">ราคา/เดือน (บาท)</label>
          <input name="price_thb" type="number" min={0} defaultValue={plan.price_thb} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-900">คำอธิบาย</label>
          <textarea name="description" defaultValue={plan.description ?? ""} rows={2} className={inputCls} />
        </div>
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "กำลังบันทึก..." : "💾 บันทึกแพ็ก"}
        </button>
      </form>

      <div className="mt-5 rounded-xl bg-brand-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-900/60">รายได้ต่อเดือน (ประมาณ)</span>
          <span className="font-bold text-brand-900">{thb(plan.monthlyRevenue)}</span>
        </div>
      </div>

      <p className="mt-4 text-sm font-bold text-brand-900">เนื้อหาในแพ็กนี้ ({plan.items.length})</p>
      <ul className="mt-2 space-y-1 text-sm text-brand-900/70">
        {plan.items.length === 0 ? (
          <li className="text-brand-900/40">ยังไม่มี — กำหนดได้ในตารางด้านล่าง</li>
        ) : (
          plan.items.map((it) => (
            <li key={it.id} className="flex items-center gap-2">
              <span className="badge bg-white text-brand-600">{it.type === "course" ? "คอร์ส" : "ชีท"}</span>
              {it.title}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function TierSelect({ product }: { product: Product }) {
  const router = useRouter();
  const { show } = useToast();
  const [pending, startTransition] = useTransition();
  const [val, setVal] = useState(product.tier ?? "");

  function onChange(next: string) {
    setVal(next);
    startTransition(async () => {
      const res = await setProductTier(product.id, next || null);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  return (
    <select
      value={val}
      disabled={pending}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-brand-200 px-2 py-1.5 text-sm outline-none focus:border-brand-500 disabled:opacity-50"
    >
      <option value="M1">แพ็ก ม.1</option>
      <option value="M4">แพ็ก ม.4</option>
      <option value="both">ทั้งสองแพ็ก</option>
      <option value="">ไม่อยู่ในแพ็ก</option>
    </select>
  );
}

export default function PlansManager({ plans, products }: { plans: Plan[]; products: Product[] }) {
  return (
    <div className="space-y-8">
      {plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center text-brand-900/40">
          ยังไม่มีแพ็ก — รัน <code>supabase_seed.sql</code> เพื่อสร้างแพ็ก ม.1 / ม.4
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      )}

      {/* กำหนดแพ็กของแต่ละสินค้า */}
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">กำหนดแพ็กของสินค้า</h2>
        <p className="text-sm text-brand-900/50">เลือกว่าคอร์ส/ชีทแต่ละชิ้นอยู่ในแพ็กบุฟเฟต์ใด</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs font-semibold text-brand-900/60">
                <th className="py-3">สินค้า</th>
                <th className="py-3">ระดับ</th>
                <th className="py-3">แพ็ก</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-brand-50 last:border-0">
                  <td className="py-3">
                    <span className="font-medium text-brand-900">{p.title}</span>
                    <span className="ml-2 text-xs text-brand-900/40">{p.type === "course" ? "คอร์ส" : "ชีท"}</span>
                  </td>
                  <td className="py-3 text-brand-900/70">{p.level}</td>
                  <td className="py-3"><TierSelect product={p} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
