// กราฟแท่งแนวนอน (server component ได้ ไม่ใช้ hook) — ใช้แสดง Top คอร์สขายดี
// data: [{ label, value }]
export default function BarChart({
  data,
  unit = "",
}: {
  data: { label: string; value: number }[];
  unit?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-brand-900/40">
        ยังไม่มีข้อมูล
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-sm">
            <span className="line-clamp-1 font-medium text-brand-900">{d.label}</span>
            <span className="ml-2 flex-none font-bold text-brand-700">
              {d.value.toLocaleString("th-TH")}
              {unit}
            </span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-brand-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
              style={{ width: `${Math.max((d.value / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
