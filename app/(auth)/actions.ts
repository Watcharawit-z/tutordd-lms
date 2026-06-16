"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/lib/action-types";

// แปล error ของ Supabase เป็นภาษาไทยแบบเข้าใจง่าย
function thaiAuthError(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "อีเมลนี้ถูกใช้สมัครแล้ว กรุณาเข้าสู่ระบบ";
  if (m.includes("email not confirmed"))
    return "ยังไม่ได้ยืนยันอีเมล กรุณาตรวจกล่องอีเมลของคุณก่อน";
  if (m.includes("rate limit") || m.includes("too many"))
    return "ทำรายการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
  if (m.includes("database error"))
    return "ระบบฐานข้อมูลมีปัญหาในการสร้างบัญชี กรุณาลองใหม่ หรือติดต่อผู้ดูแล";
  if (m.includes("password")) return "รหัสผ่านไม่ผ่านเงื่อนไข (อย่างน้อย 6 ตัวอักษร)";
  if (m.includes("email")) return "อีเมลไม่ถูกต้อง";
  return msg || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

// ---------- เข้าสู่ระบบ ----------
export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/learn");

  if (!email || !password) return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };

  // เรียก Supabase แยกใน try/catch — กันไม่ให้ exception หลุดออกไป
  // (ถ้า exception หลุด useFormState จะได้ค่าเป็น {} ที่อ่านไม่ออก)
  let errorMsg: string | null = null;
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) errorMsg = thaiAuthError(error.message);
  } catch (e: any) {
    return { error: "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }

  if (errorMsg) return { error: errorMsg };

  // สำเร็จ → redirect (ต้องอยู่นอก try/catch เพราะ redirect ทำงานด้วยการ throw)
  revalidatePath("/", "layout");
  redirect(redirectTo || "/learn");
}

// ---------- สมัครสมาชิก ----------
export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) return { error: "กรุณากรอกข้อมูลให้ครบ" };
  if (password.length < 6) return { error: "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร" };

  let result: { hasSession: boolean } | null = null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }, // ส่งไปให้ trigger สร้าง profile
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/learn`,
      },
    });

    // 🔎 DEBUG: ดูผลลัพธ์จริงจาก Supabase ใน Terminal
    console.log(
      "[register] signUp result:",
      JSON.stringify(
        {
          user: data?.user ? { id: data.user.id, identities: data.user.identities?.length } : null,
          hasSession: !!data?.session,
          error: error ? { message: error.message, status: (error as any).status } : null,
        },
        null,
        2
      )
    );

    if (error) {
      // ระหว่าง debug คืนข้อความจริงให้เห็นบนหน้าจอด้วย
      return { error: thaiAuthError(error.message) + ` [debug: ${error.message}]` };
    }

    // กรณีอีเมลซ้ำ + เปิดยืนยันอีเมล: Supabase จะคืน user ที่ identities ว่าง (กันการเดาอีเมล)
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: "อีเมลนี้ถูกใช้สมัครแล้ว กรุณาเข้าสู่ระบบ" };
    }

    // ถ้าโปรเจกต์เปิด "ยืนยันอีเมล" จะยังไม่มี session ทันที
    if (!data.session) {
      return {
        message:
          "สมัครสำเร็จ! เราได้ส่งอีเมลยืนยันให้แล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
      };
    }

    result = { hasSession: true };
  } catch (e: any) {
    // 🔎 DEBUG: log exception จริงออก Terminal + แสดงบนหน้าจอ
    console.log("[register] caught exception:", e);
    return { error: "เชื่อมต่อระบบไม่สำเร็จ [debug: " + String(e?.message ?? e) + "]" };
  }

  // มี session แล้ว (ยืนยันอีเมลปิดอยู่) → เข้าเว็บได้ทันที
  if (result?.hasSession) {
    revalidatePath("/", "layout");
    redirect("/learn");
  }

  // เผื่อกรณีไม่คาดคิด — คืนข้อความที่อ่านได้แทน {} ว่าง ๆ
  return { error: "ไม่สามารถสมัครได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" };
}

// ---------- ออกจากระบบ ----------
export async function logout(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // ไม่ว่าผลเป็นอย่างไรก็พากลับหน้าแรก
  }
  revalidatePath("/", "layout");
  redirect("/");
}
