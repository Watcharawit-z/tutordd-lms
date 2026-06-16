import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProducts } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "ชีทสรุป (PDF)",
  description: "ชีทสรุปคณิต–วิทย์ ดาวน์โหลดไฟล์ PDF ได้ทันทีหลังชำระเงิน",
};

export const dynamic = "force-dynamic";

export default async function SheetsPage() {
  const sheets = await getPublishedProducts("sheet");

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">ชีทสรุป</p>
        <h1 className="section-title mt-2">ชีทสรุป (PDF) อ่านทบทวนก่อนสอบ</h1>
        <p className="mt-3 leading-relaxed text-brand-900/60">
          สรุปเนื้อหาและโจทย์พร้อมเฉลย ซื้อแล้วดาวน์โหลดไฟล์ PDF ได้ทันที
          ลิงก์ดาวน์โหลดปลอดภัย เหมาะอ่านทบทวนช่วงโค้งสุดท้าย
        </p>
      </header>

      {sheets.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-10 text-center text-brand-900/50">
          ยังไม่มีชีทที่เผยแพร่ — เพิ่มได้ในหน้า Admin หรือรัน <code>supabase_seed.sql</code>
        </p>
      )}

      <div className="mt-12 rounded-2xl bg-brand-50 p-6 text-center">
        <p className="text-brand-900/70">
          ชีทหลายเล่มอยู่ในแพ็กบุฟเฟต์ด้วย —{" "}
          <Link href="/plans" className="font-semibold text-brand-700 hover:underline">
            ดูแพ็กบุฟเฟต์รายเดือน →
          </Link>
        </p>
      </div>
    </div>
  );
}
