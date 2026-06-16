import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, getLessonsWithStats } from "@/lib/admin";
import LessonsManager from "./LessonsManager";

export const dynamic = "force-dynamic";

export default async function LessonsPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const { product, lessons } = await getLessonsWithStats(params.id);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-brand-700 hover:underline">
        ← กลับรายการสินค้า
      </Link>
      <p className="mb-6 mt-2 text-brand-900/60">
        จัดการบทเรียนของ “{product.title}”
      </p>
      <LessonsManager productId={params.id} initial={lessons} />
    </div>
  );
}
