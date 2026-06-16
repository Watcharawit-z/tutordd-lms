import Link from "next/link";
import { requireAdmin, getAdminProducts } from "@/lib/admin";
import ProductsTable from "./ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAdminProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-brand-900/60">จัดการคอร์สและชีททั้งหมด เพิ่ม แก้ไข หรือเผยแพร่</p>
        <Link href="/admin/products/new" className="btn-primary">
          ＋ เพิ่มสินค้าใหม่
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
