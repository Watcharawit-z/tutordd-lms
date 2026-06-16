"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { thaiDate } from "@/lib/format";

type Student = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  purchases: number;
  subTier: string | null;
};

export default function StudentsTable({ students }: { students: Student[] }) {
  const [q, setQ] = useState("");
  const [onlySub, setOnlySub] = useState(false);

  const rows = useMemo(
    () =>
      students.filter((s) => {
        if (onlySub && !s.subTier) return false;
        if (q) {
          const t = (s.name + " " + s.email).toLowerCase();
          if (!t.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [students, q, onlySub]
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-brand-900">
          <input type="checkbox" checked={onlySub} onChange={(e) => setOnlySub(e.target.checked)} className="h-4 w-4 rounded border-brand-300" />
          แสดงเฉพาะสมาชิกแพ็กบุฟเฟต์
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 ค้นหาชื่อหรืออีเมล..."
          className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-72"
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/50 text-left text-xs font-semibold text-brand-900/60">
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">วันสมัคร</th>
              <th className="px-4 py-3 text-center">ซื้อเดี่ยว</th>
              <th className="px-4 py-3 text-center">แพ็ก</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brand-900/40">ไม่พบนักเรียน</td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-b border-brand-50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-brand-900">{s.name}</span>
                    {s.role === "admin" && <span className="badge ml-2 bg-brand-100 text-brand-700">แอดมิน</span>}
                  </td>
                  <td className="px-4 py-3 text-brand-900/70">{s.email}</td>
                  <td className="px-4 py-3 text-brand-900/70">{thaiDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-center text-brand-900/80">{s.purchases}</td>
                  <td className="px-4 py-3 text-center">
                    {s.subTier ? (
                      <span className="badge bg-accent-500/15 text-accent-600">{s.subTier}</span>
                    ) : (
                      <span className="text-brand-900/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/students/${s.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                      ดูรายละเอียด →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
