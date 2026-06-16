// การ์ดสถิติบนหน้า dashboard — ไอคอน (emoji) + ตัวเลขใหญ่ + คำอธิบาย
export default function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-900/60">
        <span className="text-xl" aria-hidden>
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-2 text-3xl font-extrabold text-brand-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-brand-900/40">{hint}</p>}
    </div>
  );
}
