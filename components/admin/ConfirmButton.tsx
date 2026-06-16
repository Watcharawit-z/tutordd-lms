"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import type { ActionResult } from "@/lib/action-types";

// ปุ่มที่มี dialog ยืนยันก่อนทำงาน (ใช้กับการลบ / เปลี่ยนสถานะสำคัญ)
// แสดง loading ระหว่างทำงาน + toast หลังเสร็จ + refresh ข้อมูล
export default function ConfirmButton({
  action,
  children,
  className = "",
  title = "ยืนยันการทำรายการ",
  message = "แน่ใจไหมว่าต้องการทำรายการนี้?",
  confirmLabel = "ยืนยัน",
  danger = false,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  title?: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();
  const router = useRouter();

  function run() {
    startTransition(async () => {
      const res = await action();
      show(res.message, res.ok ? "success" : "error");
      setOpen(false);
      if (res.ok) router.refresh();
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${
                  danger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-lg font-bold text-brand-900">{title}</h3>
                <p className="mt-1 text-sm text-brand-900/60">{message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="btn-ghost"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={run}
                disabled={pending}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-700 hover:bg-brand-800"
                }`}
              >
                {pending ? "กำลังทำรายการ..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
