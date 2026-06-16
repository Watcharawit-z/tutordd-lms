import { getSiteSettings, getSetting } from "@/lib/queries";
import TawkChat from "./TawkChat";

// อ่าน Tawk.to Property ID จาก site_settings ก่อน (แก้ในหลังบ้านได้ทันที)
// ถ้าไม่มีในฐานข้อมูล ใช้ค่าจาก env NEXT_PUBLIC_TAWK_ID เป็น fallback
export default async function TawkChatLoader() {
  const settings = await getSiteSettings();
  const id = getSetting(settings, "tawk_id", process.env.NEXT_PUBLIC_TAWK_ID ?? "");
  return <TawkChat id={id} />;
}
