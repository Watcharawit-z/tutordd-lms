import Link from "next/link";
import { getSiteSettings, getSetting } from "@/lib/queries";

// Footer ดึงข้อมูลติดต่อ/โซเชียลจาก site_settings (แก้ได้ในหลังบ้าน)
export default async function Footer() {
  const s = await getSiteSettings();
  const siteName = getSetting(s, "site_name", "Tutor DD");
  const tagline = getSetting(s, "site_tagline", "สถาบันกวดวิชาออนไลน์ คณิต–วิทย์");
  const line = getSetting(s, "contact_line");
  const email = getSetting(s, "contact_email");
  const hours = getSetting(s, "contact_hours");
  const phone = getSetting(s, "contact_phone");

  const socials = [
    { label: "Facebook", url: getSetting(s, "social_facebook") },
    { label: "TikTok", url: getSetting(s, "social_tiktok") },
    { label: "YouTube", url: getSetting(s, "social_youtube") },
    { label: "Line", url: getSetting(s, "social_line_url") },
  ].filter((x) => x.url);

  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-950 text-brand-100">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-base font-extrabold text-brand-900">
              DD
            </span>
            <span className="text-lg font-bold text-white">{siteName}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-200">{tagline}</p>

          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {socials.map((so) => (
                <li key={so.label}>
                  <a href={so.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20">
                    {so.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">เมนู</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li><Link href="/courses" className="hover:text-white">คอร์สออนไลน์</Link></li>
            <li><Link href="/sheets" className="hover:text-white">ชีทสรุป</Link></li>
            <li><Link href="/plans" className="hover:text-white">แพ็กบุฟเฟต์รายเดือน</Link></li>
            <li><Link href="/portfolio" className="hover:text-white">ผลงานนักเรียน</Link></li>
            <li><Link href="/#reviews" className="hover:text-white">รีวิวผู้เรียน</Link></li>
            <li><Link href="/learn" className="hover:text-white">คอร์สของฉัน</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">ติดต่อ</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            {line && <li>LINE: {line}</li>}
            {phone && <li>โทร: {phone}</li>}
            {email && <li>อีเมล: {email}</li>}
            {hours && <li>เวลาทำการ: {hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-900">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-brand-300 sm:flex-row">
          <span>© {new Date().getFullYear()} {siteName}. สงวนลิขสิทธิ์.</span>
          <span>เรียนออนไลน์ได้ทุกที่ ทุกเวลา</span>
        </div>
      </div>
    </footer>
  );
}
