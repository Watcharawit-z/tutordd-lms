import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProducts } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "คอร์สออนไลน์",
  description: "รวมคอร์สเรียนออนไลน์ คณิต–วิทย์ เตรียมสอบเข้า ม.1 และ ม.4",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getPublishedProducts("course");

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">คอร์สออนไลน์</p>
        <h1 className="section-title mt-2">เลือกคอร์สที่ใช่สำหรับน้อง</h1>
        <p className="mt-3 leading-relaxed text-brand-900/60">
          คอร์สวิดีโอ เรียนซ้ำได้ไม่จำกัด พร้อมแบบฝึกหัดและการติดตามความคืบหน้า
          ซื้อแล้วเข้าเรียนในเว็บได้ทันที หรือสมัครแพ็กบุฟเฟต์เพื่อดูได้ทุกคอร์สในระดับเดียวกัน
        </p>
      </header>

      {courses.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-10 text-center text-brand-900/50">
          ยังไม่มีคอร์สที่เผยแพร่ — เพิ่มคอร์สได้ในหน้า Admin หรือรัน <code>supabase_seed.sql</code>
        </p>
      )}

      <div className="mt-12 rounded-2xl bg-brand-50 p-6 text-center">
        <p className="text-brand-900/70">
          อยากดูได้ทุกคอร์สในระดับเดียว?{" "}
          <Link href="/plans" className="font-semibold text-brand-700 hover:underline">
            ดูแพ็กบุฟเฟต์รายเดือน →
          </Link>
        </p>
      </div>
    </div>
  );
}
