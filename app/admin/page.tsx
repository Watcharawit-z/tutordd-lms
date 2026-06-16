import Link from "next/link";
import { requireAdmin, getDashboard } from "@/lib/admin";
import { thb, thaiRelative } from "@/lib/format";
import StatCard from "@/components/admin/StatCard";
import LineChart from "@/components/admin/LineChart";
import BarChart from "@/components/admin/BarChart";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requireAdmin();
  const d = await getDashboard();

  return (
    <div className="space-y-8">
      {/* การ์ดสถิติ 6 ใบ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon="💰" label="รายได้วันนี้" value={thb(d.revenueToday)} />
        <StatCard icon="💰" label="รายได้เดือนนี้" value={thb(d.revenueMonth)} />
        <StatCard icon="👥" label="นักเรียนทั้งหมด" value={d.studentCount.toLocaleString("th-TH")} hint="บัญชีที่สมัครแล้ว" />
        <StatCard icon="📚" label="กำลังเรียนอยู่" value={d.activeLearners.toLocaleString("th-TH")} hint="ใน 30 วันล่าสุด" />
        <StatCard icon="🔄" label="สมาชิกแพ็ก ม.1" value={d.subM1.toLocaleString("th-TH")} hint="ที่ยังจ่ายอยู่" />
        <StatCard icon="🔄" label="สมาชิกแพ็ก ม.4" value={d.subM4.toLocaleString("th-TH")} hint="ที่ยังจ่ายอยู่" />
      </div>

      {/* กราฟ */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="font-bold text-brand-900">รายได้ย้อนหลัง 30 วัน</h2>
          <p className="text-sm text-brand-900/50">รวมยอดออเดอร์ที่ชำระแล้วในแต่ละวัน</p>
          <div className="mt-4">
            <LineChart data={d.series} />
          </div>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
          <h2 className="font-bold text-brand-900">คอร์สขายดี Top 5</h2>
          <p className="text-sm text-brand-900/50">นับจากจำนวนออเดอร์</p>
          <div className="mt-5">
            <BarChart data={d.topProducts} unit=" ครั้ง" />
          </div>
        </div>
      </div>

      {/* ตารางล่าง */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-900">ออเดอร์ล่าสุด</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            {d.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-brand-900/40">ยังไม่มีออเดอร์</p>
            ) : (
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-left text-xs text-brand-900/50">
                    <th className="pb-2">ผู้ซื้อ</th>
                    <th className="pb-2">สินค้า</th>
                    <th className="pb-2 text-right">ราคา</th>
                    <th className="pb-2 text-center">สถานะ</th>
                    <th className="pb-2 text-right">เวลา</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-brand-50">
                      <td className="py-2.5 font-medium text-brand-900">{o.buyer}</td>
                      <td className="py-2.5 text-brand-900/70">{o.product}</td>
                      <td className="py-2.5 text-right font-semibold text-brand-900">{thb(o.amount)}</td>
                      <td className="py-2.5 text-center"><OrderStatusBadge status={o.status} /></td>
                      <td className="py-2.5 text-right text-xs text-brand-900/50">{thaiRelative(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-900">นักเรียนใหม่ล่าสุด</h2>
            <Link href="/admin/students" className="text-sm font-semibold text-brand-700 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {d.newStudents.length === 0 ? (
              <p className="py-8 text-center text-sm text-brand-900/40">ยังไม่มีนักเรียน</p>
            ) : (
              d.newStudents.map((s) => (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {s.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">{s.name}</p>
                    <p className="truncate text-xs text-brand-900/50">{s.email}</p>
                  </div>
                  <span className="ml-auto flex-none text-xs text-brand-900/40">{thaiRelative(s.createdAt)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
