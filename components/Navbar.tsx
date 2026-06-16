import { createClient } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

// Navbar เป็น Server Component: อ่าน session + role แล้วส่งให้ฝั่ง client
export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <NavbarClient
      isLoggedIn={!!user}
      isAdmin={isAdmin}
      email={user?.email ?? null}
    />
  );
}
