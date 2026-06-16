import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// โครงหน้าเว็บฝั่งผู้ใช้ทั่วไป (Navbar + เนื้อหา + Footer)
// ใช้ครอบทุกกลุ่มหน้า ยกเว้น /admin ที่มีโครงของตัวเอง
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
