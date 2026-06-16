import { requireAdmin, getAdminReviews, getAllProductsLite } from "@/lib/admin";
import ReviewsTable from "./ReviewsTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const [reviews, products] = await Promise.all([getAdminReviews(), getAllProductsLite()]);
  return (
    <div>
      <p className="mb-6 text-brand-900/60">
        เพิ่มรีวิว, แนบรูปประกอบ, เปิด/ซ่อน และปักหมุดรีวิวเด่นขึ้นหน้าแรก
      </p>
      <ReviewsTable reviews={reviews} products={products.map((p) => ({ id: p.id, title: p.title }))} />
    </div>
  );
}
