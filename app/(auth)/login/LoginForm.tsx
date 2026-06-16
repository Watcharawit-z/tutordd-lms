"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { login } from "../actions";
import type { AuthState } from "@/lib/action-types";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full text-base disabled:opacity-60">
      {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
    </button>
  );
}

export default function LoginForm() {
  const params = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/learn";
  const [state, setState] = useState<AuthState>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    // เรียก server action ตรง ๆ — ถ้าสำเร็จ action จะ redirect ให้เอง (โค้ดหลังจากนี้จะไม่ทำงาน)
    const result = await login(null, formData);
    setState(result);
    setPending(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-brand-100 bg-white p-8 shadow-card">
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">เข้าสู่ระบบ</h1>
      <p className="mt-2 text-sm text-brand-900/60">เข้าสู่ระบบเพื่อดูคอร์สและชีทที่ซื้อไว้</p>

      {params.get("error") === "admin-only" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
        </p>
      )}
      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label className="block text-sm font-medium text-brand-900">อีเมล</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-900">รหัสผ่าน</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <SubmitButton pending={pending} />
      </form>

      <p className="mt-6 text-center text-sm text-brand-900/60">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
