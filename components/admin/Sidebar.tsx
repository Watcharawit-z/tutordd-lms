"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/(auth)/actions";

// เมนูทั้งหมดของหลังบ้าน พร้อมไอคอน (emoji ช่วยให้เข้าใจง่าย)
const menu = [
  { href: "/admin", label: "ภาพรวมธุรกิจ", icon: "📊", exact: true },
  { href: "/admin/products", label: "คอร์สและชีท", icon: "📚" },
  { href: "/admin/plans", label: "แพ็กบุฟเฟต์", icon: "🎟️" },
  { href: "/admin/orders", label: "ออเดอร์", icon: "🧾" },
  { href: "/admin/students", label: "นักเรียน", icon: "👥" },
  { href: "/admin/analytics", label: "วิเคราะห์การเรียน", icon: "📈" },
  { href: "/admin/reviews", label: "รีวิว", icon: "⭐" },
  { href: "/admin/portfolio", label: "ผลงานนักเรียน", icon: "🖼️" },
];

export default function Sidebar({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(item: (typeof menu)[number]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {menu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            isActive(item)
              ? "bg-brand-700 text-white"
              : "text-brand-100 hover:bg-white/10"
          }`}
        >
          <span className="text-lg" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 pt-4">
      <div className="px-2">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-brand-300">{email}</p>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Link
          href="/admin/settings"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10 ${
            pathname.startsWith("/admin/settings") ? "bg-brand-700 text-white" : "text-brand-100"
          }`}
        >
          ⚙️ ตั้งค่าเว็บ
        </Link>
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-100 hover:bg-white/10"
        >
          🌐 ไปหน้าเว็บหลัก
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-100 hover:bg-white/10"
          >
            🚪 ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* แถบบนสำหรับมือถือ/แท็บเล็ตแนวตั้ง */}
      <div className="flex items-center justify-between border-b border-brand-100 bg-brand-950 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-brand-900">
            DD
          </span>
          <span className="font-bold text-white">หลังบ้าน</span>
        </Link>
        <button
          type="button"
          aria-label="เมนู"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {/* Sidebar เดสก์ท็อป (คงที่) */}
      <aside className="hidden w-64 flex-none flex-col bg-brand-950 p-5 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-extrabold text-brand-900">
            DD
          </span>
          <div>
            <p className="font-bold leading-tight text-white">Tutor DD</p>
            <p className="text-xs text-brand-300">ระบบหลังบ้าน</p>
          </div>
        </Link>
        {nav}
        {footer}
      </aside>

      {/* Sidebar มือถือ (เลื่อนลงมา) */}
      {open && (
        <div className="flex flex-col bg-brand-950 p-5 lg:hidden">
          {nav}
          <div className="mt-4">{footer}</div>
        </div>
      )}
    </>
  );
}
