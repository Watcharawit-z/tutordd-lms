"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

// ปุ่มซื้อ — Phase 1 ยังไม่มีระบบชำระเงินจริง
// Phase 4 จะเปลี่ยน handler ให้ POST ไปที่ /api/checkout เพื่อสร้าง Stripe session
export default function BuyButton({ product }: { product: Product }) {
  const [pending, setPending] = useState(false);

  async function handleBuy() {
    setPending(true);
    // TODO (Phase 4): เรียก /api/checkout แล้ว redirect ไป Stripe Checkout
    // const res = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ productId: product.id }) });
    // const { url } = await res.json(); window.location.href = url;
    await new Promise((r) => setTimeout(r, 400));
    setPending(false);
    alert(
      `ระบบชำระเงินจะเปิดใช้งานใน Phase 4\n\nสินค้า: ${product.title}\nราคา: ${product.priceTHB.toLocaleString("th-TH")} บาท`
    );
  }

  return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={pending}
      className="btn-accent mt-5 w-full text-base disabled:opacity-60"
    >
      {pending ? "กำลังดำเนินการ..." : product.type === "course" ? "ซื้อคอร์สนี้" : "ซื้อชีทนี้"}
    </button>
  );
}
