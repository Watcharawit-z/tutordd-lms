import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  return (
    <div className="container-page flex min-h-[72vh] items-center justify-center py-16">
      <RegisterForm />
    </div>
  );
}
