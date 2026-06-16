import { requireAdmin, getOrders } from "@/lib/admin";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getOrders();
  return (
    <div>
      <p className="mb-6 text-brand-900/60">ออเดอร์ทั้งหมด กรองตามสถานะ/ประเภท/ช่วงวันที่ และดาวน์โหลดเป็นไฟล์ Excel (CSV)</p>
      <OrdersTable orders={orders} />
    </div>
  );
}
