import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ToastProvider } from "@/components/admin/Toast";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export const dynamic = "force-dynamic";

// โครงหลังบ้าน: ป้องกัน role=admin (ซ้ำกับ middleware เพื่อความปลอดภัย)
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/learn?error=admin-only");

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-brand-50/50 lg:flex-row">
        <Sidebar name={profile?.full_name || "ผู้ดูแลระบบ"} email={user.email ?? ""} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <div className="flex-1 p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
