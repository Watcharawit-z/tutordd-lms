import { requireAdmin, getSettingsAdmin, getAllInstructors } from "@/lib/admin";
import SettingsTabs from "./SettingsTabs";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, instructors] = await Promise.all([getSettingsAdmin(), getAllInstructors()]);
  return (
    <div>
      <p className="mb-6 text-brand-900/60">
        แก้ไขข้อมูลเว็บไซต์ทั้งหมดได้ที่นี่ โดยไม่ต้องแตะโค้ด
      </p>
      <SettingsTabs settings={settings} instructors={instructors} />
    </div>
  );
}
