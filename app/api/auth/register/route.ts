import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password)
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" });

    if (password.length < 6)
      return NextResponse.json({ error: "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร" });

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    console.log("[register]", JSON.stringify({ error, hasSession: !!data?.session }));

    if (error) return NextResponse.json({ error: error.message });
    if (data?.session) return NextResponse.json({ ok: true });

    return NextResponse.json({ message: "ส่งอีเมลยืนยันแล้ว กรุณาตรวจกล่องอีเมลก่อนเข้าสู่ระบบ" });
  } catch (e: any) {
    console.error("[register error]", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด: " + String(e?.message ?? e) });
  }
}
