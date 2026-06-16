"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/(auth)/actions";

const navLinks = [
  { href: "/courses", label: "คอร์สออนไลน์" },
  { href: "/sheets", label: "ชีทสรุป" },
  { href: "/plans", label: "แพ็กบุฟเฟต์" },
  { href: "/portfolio", label: "ผลงานนักเรียน" },
  { href: "/#reviews", label: "รีวิว" },
];

export default function NavbarClient({
  isLoggedIn,
  isAdmin,
  email,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
  email: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-base font-extrabold text-white">
            DD
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-900">Tutor DD</span>
        </Link>

        {/* เมนูเดสก์ท็อป */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-700 ${
                  active ? "text-brand-700" : "text-brand-900/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAdmin && (
            <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              หลังบ้าน
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link href="/learn" className="btn-primary px-4 py-2">คอร์สของฉัน</Link>
              <form action={logout}>
                <button type="submit" className="btn-ghost px-4 py-2" title={email ?? ""}>
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-4 py-2">เข้าสู่ระบบ</Link>
              <Link href="/register" className="btn-primary px-4 py-2">สมัครสมาชิก</Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="เมนู"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-800 hover:bg-brand-50 md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
          </svg>
        </button>
      </nav>

      {/* เมนูมือถือ */}
      {open && (
        <div className="border-t border-brand-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-brand-900/80 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                หลังบ้าน
              </Link>
            )}
            <div className="mt-2 flex gap-2">
              {isLoggedIn ? (
                <>
                  <Link href="/learn" onClick={() => setOpen(false)} className="btn-primary flex-1 px-4 py-2">คอร์สของฉัน</Link>
                  <form action={logout} className="flex-1">
                    <button type="submit" className="btn-ghost w-full px-4 py-2">ออกจากระบบ</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1 px-4 py-2">เข้าสู่ระบบ</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 px-4 py-2">สมัคร</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
