import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatTHB, tierLabel } from "@/lib/types";
import ProductCover from "./ProductCover";

// การ์ดสินค้า ใช้ทั้งหน้าแรก / รายการคอร์ส / รายการชีท
export default function ProductCard({
  product,
  owned = false,
}: {
  product: Product;
  owned?: boolean;
}) {
  const isCourse = product.type === "course";
  const meta = isCourse
    ? `${product.lessons.length} บทเรียน`
    : `${product.pages ?? 0} หน้า`;
  const tier = tierLabel(product.tier);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/product/${product.slug}`} className="block">
        <ProductCover product={product} className="h-44" />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
          <span>{product.subject}</span>
          <span className="text-brand-200">•</span>
          <span>{meta}</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-brand-900 group-hover:text-brand-700">
            {product.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-900/60">
          {product.shortDesc}
        </p>

        {tier && (
          <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-600">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" /></svg>
            {tier}
          </span>
        )}

        <div className="mt-5 flex items-end justify-between">
          <div>
            {product.oldPriceTHB && (
              <span className="mr-2 text-sm text-brand-300 line-through">
                {formatTHB(product.oldPriceTHB)}
              </span>
            )}
            <span className="text-2xl font-extrabold text-brand-800">
              {formatTHB(product.priceTHB)}
            </span>
          </div>
        </div>

        <div className="mt-5">
          {owned ? (
            <Link href="/learn" className="btn-accent w-full">
              {isCourse ? "เข้าเรียน" : "ดาวน์โหลด"}
            </Link>
          ) : (
            <Link href={`/product/${product.slug}`} className="btn-primary w-full">
              ดูรายละเอียด
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
