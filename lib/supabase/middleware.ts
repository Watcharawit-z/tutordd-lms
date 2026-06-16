import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// รีเฟรช session ทุก request + ป้องกันเส้นทางที่ต้องล็อกอิน
// เรียกจาก middleware.ts ที่ root
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ดึง user (จะรีเฟรช token ให้อัตโนมัติถ้าจำเป็น)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // เส้นทางที่ต้องล็อกอินก่อน
  const protectedPrefixes = ["/learn", "/admin", "/account"];
  const needsAuth = protectedPrefixes.some((p) => path.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // เส้นทาง /admin ต้องเป็น role = admin เท่านั้น
  if (path.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/learn";
      url.searchParams.set("error", "admin-only");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
