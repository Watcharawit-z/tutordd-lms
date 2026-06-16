"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import type { ActionResult } from "@/lib/action-types";

// สวิตช์เปิด/ปิดแบบกดสลับทันที (เช่น Published/Draft, อนุมัติรีวิว, ดูฟรี)
// การกระทำนี้ย้อนกลับได้ จึงไม่ต้อง confirm — แต่มี loading + toast
export default function ToggleSwitch({
  checked,
  action,
  onLabel = "เปิด",
  offLabel = "ปิด",
}: {
  checked: boolean;
  action: (next: boolean) => Promise<ActionResult>;
  onLabel?: string;
  offLabel?: string;
}) {
  const [pending, startTransition] = useTransition();
  const { show } = useToast();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const res = await action(!checked);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="inline-flex items-center gap-2 disabled:opacity-50"
      title={checked ? `กดเพื่อ${offLabel}` : `กดเพื่อ${onLabel}`}
    >
      <span
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition ${
          checked ? "bg-green-500" : "bg-brand-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className={`text-xs font-semibold ${checked ? "text-green-700" : "text-brand-900/50"}`}>
        {pending ? "..." : checked ? onLabel : offLabel}
      </span>
    </button>
  );
}
