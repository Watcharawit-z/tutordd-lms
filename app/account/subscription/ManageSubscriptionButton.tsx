"use client";

import { useState } from "react";

// ปุ่มไป Stripe Customer Portal — Phase 2 ยัง mock
// Phase 4: POST /api/portal → รับ url ของ Stripe Billing Portal แล้ว redirect
export default function ManageSubscriptionButton() {
  const [pending, setPending] = useState(false);

  async function handleManage() {
    setPending(true);
    await new Promise((r) => setTimeout(r, 350));
    setPending(false);
    alert(
      "Stripe Customer Portal (ยกเลิก/เปลี่ยนแพ็ก) จะเปิดใช้งานใน Phase 4"
    );
  }

  return (
    <button
      type="button"
      onClick={handleManage}
      disabled={pending}
      className="btn-primary w-full disabled:opacity-60"
    >
      {pending ? "กำลังเปิด..." : "ยกเลิก / เปลี่ยนแพ็ก"}
    </button>
  );
}
