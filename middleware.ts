import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// middleware หลัก: รีเฟรช session + ป้องกัน /learn, /admin, /account
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // ทำงานทุกเส้นทาง ยกเว้น static asset / รูป / favicon
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
