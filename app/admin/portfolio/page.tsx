import { requireAdmin, getAdminPortfolio, getAllProductsLite } from "@/lib/admin";
import PortfolioManager from "./PortfolioManager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  await requireAdmin();
  const [posts, products] = await Promise.all([getAdminPortfolio(), getAllProductsLite()]);
  return (
    <div>
      <p className="mb-6 text-brand-900/60">
        จัดการรูปผลงาน/ความสำเร็จของนักเรียน (แสดงแบบกริด Instagram บนหน้า “ผลงานนักเรียน”)
      </p>
      <PortfolioManager
        posts={posts}
        products={products.map((p) => ({ id: p.id, title: p.title }))}
      />
    </div>
  );
}
