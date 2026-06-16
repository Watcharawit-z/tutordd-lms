import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, getProductById } from "@/lib/admin";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const product = await getProductById(params.id);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-brand-700 hover:underline">
        ← กลับรายการสินค้า
      </Link>
      <p className="mb-6 mt-2 text-brand-900/60">แก้ไขรายละเอียดของ “{product.title}”</p>
      <ProductForm product={product} />
    </div>
  );
}
