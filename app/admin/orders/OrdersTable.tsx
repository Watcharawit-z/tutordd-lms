"use client";

import { useMemo, useState } from "react";
import { thb, thaiDateTime } from "@/lib/format";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

type Order = {
  id: string;
  buyer: string;
  email: string;
  product: string;
  productType: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
};

const methodText = (m: string) =>
  m === "promptpay" ? "พร้อมเพย์" : m === "card" ? "บัตรเครดิต" : m === "—" ? "—" : m;

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (type !== "all" && o.productType !== type) return false;
      const t = new Date(o.createdAt).getTime();
      if (from && t < new Date(from).getTime()) return false;
      if (to && t > new Date(to).getTime() + 86400000) return false;
      return true;
    });
  }, [orders, status, type, from, to]);

  function exportCSV() {
    const header = ["วันที่เวลา", "ผู้ซื้อ", "อีเมล", "สินค้า", "ประเภท", "ราคา(บาท)", "วิธีชำระ", "สถานะ"];
    const lines = rows.map((o) =>
      [
        thaiDateTime(o.createdAt),
        o.buyer,
        o.email,
        o.product,
        o.productType === "course" ? "คอร์ส" : "ชีท",
        o.amount,
        methodText(o.method),
        o.status,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    );
    // ใส่ BOM เพื่อให้ Excel อ่านภาษาไทยถูก
    const csv = "﻿" + [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selCls = "rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-brand-900/60">สถานะ</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`mt-1 ${selCls}`}>
            <option value="all">ทั้งหมด</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="pending">รอชำระ</option>
            <option value="failed">ล้มเหลว</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-900/60">ประเภท</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={`mt-1 ${selCls}`}>
            <option value="all">ทั้งหมด</option>
            <option value="course">คอร์ส</option>
            <option value="sheet">ชีท</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-900/60">ตั้งแต่วันที่</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`mt-1 ${selCls}`} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-900/60">ถึงวันที่</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`mt-1 ${selCls}`} />
        </div>
        <button onClick={exportCSV} className="btn-primary ml-auto">
          ⬇️ ดาวน์โหลด CSV
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/50 text-left text-xs font-semibold text-brand-900/60">
              <th className="px-4 py-3">วันที่</th>
              <th className="px-4 py-3">ผู้ซื้อ</th>
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3 text-right">ราคา</th>
              <th className="px-4 py-3">วิธีชำระ</th>
              <th className="px-4 py-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brand-900/40">ไม่พบออเดอร์ตามเงื่อนไข</td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id} className="border-b border-brand-50 last:border-0">
                  <td className="px-4 py-3 text-xs text-brand-900/60">{thaiDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-900">{o.buyer}</p>
                    <p className="text-xs text-brand-900/45">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-900/70">{o.product}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-900">{thb(o.amount)}</td>
                  <td className="px-4 py-3 text-brand-900/70">{methodText(o.method)}</td>
                  <td className="px-4 py-3 text-center"><OrderStatusBadge status={o.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-brand-900/50">รวม {rows.length} รายการ</p>
    </div>
  );
}
