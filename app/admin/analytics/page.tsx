import { requireAdmin, getAnalytics } from "@/lib/admin";
import Funnel from "@/components/admin/Funnel";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin();
  const a = await getAnalytics();

  return (
    <div className="space-y-8">
      <p className="text-brand-900/60">วิเคราะห์พฤติกรรมการเรียนของนักเรียน เพื่อปรับปรุงคอร์ส</p>

      {/* Funnel + Retention */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
          <h2 className="font-bold text-brand-900">เส้นทางการซื้อ (Funnel)</h2>
          <p className="text-sm text-brand-900/50">จากคนเข้าดู → ปลดล็อกสิทธิ์ → ชำระเงินจริง</p>
          <div className="mt-5">
            <Funnel steps={a.funnel} />
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
          <h2 className="font-bold text-brand-900">การกลับมาเรียน (Retention)</h2>
          <p className="text-sm text-brand-900/50">
            จากผู้ซื้อ {a.totalBuyers} คน กลับมาเรียนภายใน
          </p>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {a.retention.map((r) => (
              <div key={r.window} className="rounded-xl bg-brand-50 p-4 text-center">
                <p className="text-3xl font-extrabold text-brand-700">{r.pct}%</p>
                <p className="mt-1 text-xs text-brand-900/55">ภายใน {r.window} วัน</p>
                <p className="text-xs text-brand-900/40">({r.count} คน)</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ตารางคอร์ส */}
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ภาพรวมแต่ละคอร์ส</h2>
        <div className="mt-4 overflow-x-auto">
          {a.courses.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-900/40">ยังไม่มีข้อมูลคอร์ส</p>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-xs font-semibold text-brand-900/60">
                  <th className="py-3">คอร์ส</th>
                  <th className="py-3 text-center">คนซื้อ</th>
                  <th className="py-3 text-center">เริ่มเรียน</th>
                  <th className="py-3 text-center">เรียนจบ</th>
                  <th className="py-3">อัตราเรียนจบ</th>
                </tr>
              </thead>
              <tbody>
                {a.courses.map((c) => (
                  <tr key={c.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-3 font-medium text-brand-900">{c.title}</td>
                    <td className="py-3 text-center text-brand-900/80">{c.buyers}</td>
                    <td className="py-3 text-center text-brand-900/80">{c.started}</td>
                    <td className="py-3 text-center text-brand-900/80">{c.finished}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-28 overflow-hidden rounded-full bg-brand-50">
                          <div className="h-full rounded-full bg-brand-600" style={{ width: `${c.completionRate}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-brand-700">{c.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-3 text-xs text-brand-900/40">
          “เรียนจบ” = ดูครบทุกบทของคอร์ส · ดูสถิติราย<u>บท</u> (drop-off) ได้ในหน้าจัดการบทเรียนของแต่ละคอร์ส
        </p>
      </div>
    </div>
  );
}
