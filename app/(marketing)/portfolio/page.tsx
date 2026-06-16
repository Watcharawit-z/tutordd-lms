import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPortfolio } from "@/lib/queries";
import PortfolioGrid from "@/components/PortfolioGrid";

export const metadata: Metadata = {
  title: "ผลงานนักเรียน",
  description: "รวมผลงานและความสำเร็จของนักเรียน Tutor DD ที่สอบติดโรงเรียนชั้นนำ",
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const posts = await getPublishedPortfolio();

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">ผลงานนักเรียน</p>
        <h1 className="section-title mt-2">ความสำเร็จของลูกศิษย์เรา</h1>
        <p className="mt-3 leading-relaxed text-brand-900/60">
          รวมภาพความสำเร็จของนักเรียน Tutor DD ที่ตั้งใจเรียนจนสอบติดโรงเรียนในฝัน
          กดที่รูปเพื่อดูขนาดใหญ่
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="mt-10">
          <PortfolioGrid posts={posts} />
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-12 text-center text-brand-900/50">
          ยังไม่มีรูปผลงาน — เพิ่มได้ในหน้า Admin → ผลงาน
        </div>
      )}

      <div className="mt-12 rounded-2xl bg-brand-50 p-6 text-center">
        <p className="text-brand-900/70">
          อยากเป็นคนต่อไปที่สอบติด?{" "}
          <Link href="/courses" className="font-semibold text-brand-700 hover:underline">
            เริ่มเรียนกับเราเลย →
          </Link>
        </p>
      </div>
    </div>
  );
}
