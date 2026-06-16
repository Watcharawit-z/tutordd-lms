"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { thb } from "@/lib/format";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { toggleProductStatus, deleteProduct } from "../actions";

type Row = {
  id: string;
  title: string;
  type: string;
  subject: string;
  level: string;
  tier: string | null;
  price_thb: number;
  status: string;
  buyerCount: number;
  learnerCount: number;
};

const filters = [
  { key: "all", label: "ทั้งหมด" },
  { key: "course", label: "คอร์ส" },
  { key: "sheet", label: "ชีท" },
  { key: "published", label: "เผยแพร่แล้ว" },
  { key: "draft", label: "ฉบับร่าง" },
] as const;

const tierText = (t: string | null) =>
  t === "M1" ? "ม.1" : t === "M4" ? "ม.4" : t === "both" ? "ม.1+ม.4" : "—";

export default function ProductsTable({ products }: { products: Row[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return products.filter((p) => {
      if (filter === "course" || filter === "sheet") if (p.type !== filter) return false;
      if (filter === "published" || filter === "draft") if (p.status !== filter) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, filter, q]);

  return (
    <div>
      {/* แถบ filter + ค้นหา */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f.key ? "bg-brand-700 text-white" : "bg-white text-brand-700 hover:bg-brand-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 ค้นหาชื่อสินค้า..."
          className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-64"
        />
      </div>

      {/* ตาราง */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/50 text-left text-xs font-semibold text-brand-900/60">
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3">ระดับ / แพ็ก</th>
              <th className="px-4 py-3 text-right">ราคา</th>
              <th className="px-4 py-3 text-center">คนซื้อ</th>
              <th className="px-4 py-3 text-center">กำลังเรียน/โหลด</th>
              <th className="px-4 py-3 text-center">เผยแพร่</th>
              <th className="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-brand-900/40">
                  ไม่พบสินค้าตามเงื่อนไข
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-brand-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-900">{p.title}</p>
                    <span className="badge mt-1 bg-brand-50 text-brand-600">
                      {p.type === "course" ? "📹 คอร์ส" : "📄 ชีท"} · {p.subject}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-900/70">
                    {p.level}
                    <span className="ml-1 rounded bg-accent-500/15 px-1.5 py-0.5 text-xs font-semibold text-accent-600">
                      {tierText(p.tier)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-900">{thb(p.price_thb)}</td>
                  <td className="px-4 py-3 text-center text-brand-900/80">{p.buyerCount}</td>
                  <td className="px-4 py-3 text-center text-brand-900/80">{p.learnerCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <ToggleSwitch
                        checked={p.status === "published"}
                        action={(next) => toggleProductStatus(p.id, next)}
                        onLabel="เผยแพร่"
                        offLabel="ร่าง"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                        title="แก้ไขรายละเอียดสินค้า"
                      >
                        ✏️ แก้ไข
                      </Link>
                      {p.type === "course" && (
                        <Link
                          href={`/admin/products/${p.id}/lessons`}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                          title="เพิ่ม/แก้ไขบทเรียน"
                        >
                          📋 บทเรียน
                        </Link>
                      )}
                      <ConfirmButton
                        action={() => deleteProduct(p.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        title="ลบสินค้านี้?"
                        message="แน่ใจไหมว่าต้องการลบ? ข้อมูลบทเรียนและรีวิวที่ผูกอยู่จะถูกลบด้วย และไม่สามารถกู้คืนได้"
                        confirmLabel="ลบเลย"
                        danger
                      >
                        🗑️ ลบ
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-brand-900/40">
        เคล็ดลับ: กดสวิตช์ “เผยแพร่” เพื่อสลับให้สินค้าขึ้น/ลงหน้าเว็บได้ทันที
      </p>
    </div>
  );
}
