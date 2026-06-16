"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const body = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setPending(false);

    if (data.error) {
      setError(data.error);
    } else if (data.message) {
      setMessage(data.message);
    } else if (data.ok) {
      window.location.href = "/learn";
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-brand-100 bg-white p-8 shadow-card">
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">สมัครสมาชิก</h1>
      <p className="mt-2 text-sm text-brand-900/60">สร้างบัญชีเพื่อเริ่มเรียนกับ Tutor DD</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-900">ชื่อ–นามสกุล</label>
          <input name="fullName" type="text" required placeholder="ชื่อของคุณ"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-900">อีเมล</label>
          <input name="email" type="email" required placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-900">รหัสผ่าน</label>
          <input name="password" type="password" required minLength={6} placeholder="อย่างน้อย 6 ตัวอักษร"
            className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <button type="submit" disabled={pending}
          className="btn-primary w-full text-base disabled:opacity-60">
          {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-900/60">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
