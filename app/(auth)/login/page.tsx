import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[72vh] items-center justify-center py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
