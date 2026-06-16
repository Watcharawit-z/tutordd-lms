import { requireAdmin, getAdminPlans, getAllProductsLite } from "@/lib/admin";
import PlansManager from "./PlansManager";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  await requireAdmin();
  const [plans, products] = await Promise.all([getAdminPlans(), getAllProductsLite()]);
  return (
    <div>
      <p className="mb-6 text-brand-900/60">
        ตั้งราคาและคำอธิบายแพ็กบุฟเฟต์ และกำหนดว่าคอร์ส/ชีทไหนอยู่ในแพ็กใด
      </p>
      <PlansManager plans={plans} products={products} />
    </div>
  );
}
