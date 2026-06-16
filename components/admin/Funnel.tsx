// กราฟ funnel — ขั้นตอน เข้าหน้าสินค้า → กดซื้อ → ชำระจริง
// steps: [{ label, value }] (เรียงจากมากไปน้อย)
export default function Funnel({
  steps,
}: {
  steps: { label: string; value: number }[];
}) {
  const top = steps[0]?.value || 1;

  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / top) * 100);
        // อัตราแปลงเทียบกับขั้นก่อนหน้า
        const prev = steps[i - 1]?.value;
        const conv = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-brand-900">{s.label}</span>
              <span className="font-bold text-brand-900">
                {s.value.toLocaleString("th-TH")}
                {conv !== null && (
                  <span className="ml-2 text-xs font-medium text-brand-900/45">
                    ({conv}% จากขั้นก่อน)
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-8 w-full overflow-hidden rounded-lg bg-brand-50">
              <div
                className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-brand-600 to-brand-800 pr-3 text-xs font-bold text-white"
                style={{ width: `${Math.max(pct, 8)}%` }}
              >
                {pct}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
