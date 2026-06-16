"use client";

import { useState } from "react";

// ปุ่มสมัครแพ็กบุฟเฟต์ — Phase 2 ยังเป็น mock
// Phase 4 จะเปลี่ยนเป็น POST /api/subscribe → Stripe Subscription Checkout
export default function SubscribeButton({
  planName,
  priceTHB,
  highlight = false,
}: {
  planName: string;
  priceTHB: number;
  highlight?: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function handleSubscribe() {
    setPending(true);
    await new Promise((r) => setTimeout(r, 350));
    setPending(false);
    alert(
      `ระบบสมัครสมาชิกจะเปิดใช้งานใน Phase 4\n\nแพ็ก: ${planName}\nราคา: ${priceTHB.toLocaleString("th-TH")} บาท/เดือน`
    );
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={pending}
      className={`${highlight ? "btn-accent" : "btn-primary"} w-full text-base disabled:opacity-60`}
    >
      {pending ? "กำลังดำเนินการ..." : "สมัครแพ็กนี้"}
    </button>
  );
}
