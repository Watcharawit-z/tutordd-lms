import type { Product } from "@/lib/types";

// Cover แบบ gradient + ชื่อวิชา ใช้แทนรูปจริงใน Phase 1
// (Phase 3 ผู้สอนอัปรูปจริงได้ผ่าน admin)
export default function ProductCover({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden p-5 text-white ${className}`}
      style={{
        background: `linear-gradient(135deg, ${product.coverColor}, #0b182b)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="badge bg-white/15 text-white">
          {product.type === "course" ? "คอร์สออนไลน์" : "ชีท PDF"}
        </span>
        <span className="badge bg-accent-500/90 text-brand-950">{product.level}</span>
      </div>
      <div>
        <p className="text-xs/relaxed text-white/70">{product.subject}</p>
        <p className="mt-1 text-lg font-bold leading-snug">{product.title}</p>
      </div>
      {/* ลายวงกลมตกแต่งมุม */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
    </div>
  );
}
