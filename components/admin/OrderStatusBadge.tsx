// ป้ายสถานะออเดอร์เป็นภาษาไทย พร้อมสี
const map: Record<string, { text: string; cls: string }> = {
  paid: { text: "ชำระแล้ว", cls: "bg-green-100 text-green-700" },
  pending: { text: "รอชำระ", cls: "bg-amber-100 text-amber-700" },
  failed: { text: "ล้มเหลว", cls: "bg-red-100 text-red-700" },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = map[status] ?? { text: status, cls: "bg-brand-100 text-brand-700" };
  return <span className={`badge ${s.cls}`}>{s.text}</span>;
}
