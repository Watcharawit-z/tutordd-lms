import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-brand-700 hover:underline">
        ← กลับรายการสินค้า
      </Link>
      <p className="mb-6 mt-2 text-brand-900/60">กรอกข้อมูลสินค้าใหม่ บันทึกเป็นฉบับร่างไว้ก่อนหรือเผยแพร่ทันทีก็ได้</p>
      <ProductForm />
    </div>
  );
}
