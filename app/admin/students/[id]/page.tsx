import Link from "next/link";
import { requireAdmin, getStudentDetail } from "@/lib/admin";
import { thaiDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const s = await getStudentDetail(params.id);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/students" className="text-sm text-brand-700 hover:underline">
        ← กลับรายชื่อนักเรียน
      </Link>

      {/* การ์ดข้อมูลนักเรียน */}
      <div className="mt-3 flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
          {s.name.charAt(0)}
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-brand-900">{s.name}</h2>
          <p className="text-sm text-brand-900/60">{s.email}</p>
          {s.createdAt && <p className="text-xs text-brand-900/40">สมัครเมื่อ {thaiDate(s.createdAt)}</p>}
        </div>
      </div>

      {/* subscription */}
      <div className="mt-6">
        <h3 className="font-bold text-brand-900">สถานะแพ็กบุฟเฟต์</h3>
        {s.subscription ? (
          <div className="mt-2 rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
            <p className="font-semibold text-brand-900">
              {s.subscription.name}{" "}
              <span className={`badge ml-2 ${s.subscription.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {s.subscription.status === "active" ? "ใช้งานอยู่" : s.subscription.status}
              </span>
            </p>
            {s.subscription.end && (
              <p className="mt-1 text-sm text-brand-900/55">หมดรอบ {thaiDate(s.subscription.end)}</p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-brand-900/50">ไม่ได้สมัครแพ็กบุฟเฟต์</p>
        )}
      </div>

      {/* ประวัติการซื้อ + ความคืบหน้า */}
      <div className="mt-6">
        <h3 className="font-bold text-brand-900">ประวัติการซื้อและความคืบหน้า</h3>
        {s.purchases.length === 0 ? (
          <p className="mt-2 text-sm text-brand-900/50">ยังไม่มีการซื้อ</p>
        ) : (
          <div className="mt-2 space-y-3">
            {s.purchases.map((p, i) => (
              <div key={i} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-900">
                    {p.type === "course" ? "📹" : "📄"} {p.title}
                  </p>
                  <span className="text-xs text-brand-900/50">{thaiDate(p.createdAt)}</span>
                </div>
                {p.type === "course" && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-50">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${p.progressPct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-brand-700">{p.progressPct}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
