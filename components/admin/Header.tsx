"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// แผนที่ชื่อหน้า (เส้นทาง → ชื่อภาษาไทย)
const titles: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === "/admin", title: "ภาพรวมธุรกิจ" },
  { match: (p) => p.startsWith("/admin/products") && p.includes("/lessons"), title: "จัดการบทเรียน" },
  { match: (p) => p.startsWith("/admin/products/new"), title: "เพิ่มสินค้าใหม่" },
  { match: (p) => p.startsWith("/admin/products") && p.includes("/edit"), title: "แก้ไขสินค้า" },
  { match: (p) => p.startsWith("/admin/products"), title: "คอร์สและชีท" },
  { match: (p) => p.startsWith("/admin/plans"), title: "แพ็กบุฟเฟต์" },
  { match: (p) => p.startsWith("/admin/orders"), title: "ออเดอร์ทั้งหมด" },
  { match: (p) => p.startsWith("/admin/students"), title: "นักเรียน" },
  { match: (p) => p.startsWith("/admin/analytics"), title: "วิเคราะห์การเรียน" },
  { match: (p) => p.startsWith("/admin/reviews"), title: "จัดการรีวิว" },
  { match: (p) => p.startsWith("/admin/portfolio"), title: "ผลงานนักเรียน" },
  { match: (p) => p.startsWith("/admin/settings"), title: "ตั้งค่าเว็บ" },
];

export default function Header() {
  const pathname = usePathname();
  const title = titles.find((t) => t.match(pathname))?.title ?? "หลังบ้าน";

  // นาฬิกาไทยอัปเดตทุกนาที
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now
    ? new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now)
    : "";
  const timeStr = now
    ? new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(now)
    : "";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
      <h1 className="text-xl font-extrabold text-brand-900 sm:text-2xl">{title}</h1>
      {now && (
        <div className="text-right">
          <p className="text-sm font-semibold text-brand-900">{timeStr} น.</p>
          <p className="text-xs text-brand-900/50">{dateStr}</p>
        </div>
      )}
    </header>
  );
}
