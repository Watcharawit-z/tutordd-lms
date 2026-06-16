// ผลลัพธ์มาตรฐานของทุก server action (แยกจากไฟล์ "use server"
// เพื่อให้ client component import เป็น type ได้โดยไม่ผิดกฎ)
export type ActionResult = { ok: boolean; message: string; id?: string };

// state ของฟอร์ม auth (login/register) ที่ส่งกลับให้ useFormState
// ต้องเป็น plain object เสมอ (มี error หรือ message เป็น string) ห้ามคืน object ของ Supabase ตรง ๆ
export type AuthState = { error?: string; message?: string } | null;
