"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import type { ActionResult } from "@/lib/action-types";

// สร้าง slug จากชื่อ (ถ้าเป็นไทยล้วนจะ fallback เป็น p-เวลา)
function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return base || `p-${Date.now()}`;
}

function refreshAll() {
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout"); // ให้หน้าเว็บผู้ใช้เห็นการเปลี่ยนแปลงทันที
}

// =============================================================
// สินค้า: เพิ่ม/แก้ไข (รองรับอัปโหลดรูป + PDF)
// =============================================================
export async function upsertProduct(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, message: "กรุณากรอกชื่อสินค้า" };

  const type = String(formData.get("type") ?? "course");
  const publish = formData.get("publish") === "1";

  const fields: Record<string, any> = {
    title,
    short_desc: String(formData.get("short_desc") ?? ""),
    description: String(formData.get("description") ?? ""),
    type,
    subject: String(formData.get("subject") ?? "คณิตศาสตร์"),
    level: String(formData.get("level") ?? ""),
    tier: (formData.get("tier") as string) || null,
    price_thb: Number(formData.get("price_thb") ?? 0),
    old_price_thb: formData.get("old_price_thb") ? Number(formData.get("old_price_thb")) : null,
    pages: formData.get("pages") ? Number(formData.get("pages")) : null,
    featured: formData.get("featured") === "on" || formData.get("featured") === "1",
    status: publish ? "published" : "draft",
  };

  try {
    // ---- อัปโหลดรูป thumbnail (ถ้ามี) ----
    const thumb = formData.get("thumbnail") as File | null;
    if (thumb && thumb.size > 0) {
      const ext = thumb.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${slugify(title)}.${ext}`;
      const { error: upErr } = await admin.storage
        .from("thumbnails")
        .upload(path, thumb, { contentType: thumb.type, upsert: true });
      if (upErr) return { ok: false, message: `อัปโหลดรูปไม่สำเร็จ: ${upErr.message}` };
      fields.thumbnail_url = admin.storage.from("thumbnails").getPublicUrl(path).data.publicUrl;
    }

    // ---- อัปโหลด PDF (เฉพาะชีท) ----
    const pdf = formData.get("pdf") as File | null;
    if (pdf && pdf.size > 0) {
      const path = `${Date.now()}-${slugify(title)}.pdf`;
      const { error: upErr } = await admin.storage
        .from("sheets")
        .upload(path, pdf, { contentType: "application/pdf", upsert: true });
      if (upErr) return { ok: false, message: `อัปโหลด PDF ไม่สำเร็จ: ${upErr.message}` };
      fields.sheet_storage_path = path;
    }

    if (id) {
      const { error } = await admin.from("products").update(fields).eq("id", id);
      if (error) return { ok: false, message: `บันทึกไม่สำเร็จ: ${error.message}` };
      refreshAll();
      return { ok: true, message: "บันทึกการแก้ไขแล้ว", id };
    } else {
      fields.slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 6);
      const { data, error } = await admin.from("products").insert(fields).select("id").single();
      if (error) return { ok: false, message: `เพิ่มสินค้าไม่สำเร็จ: ${error.message}` };
      refreshAll();
      return { ok: true, message: publish ? "เพิ่มและเผยแพร่แล้ว" : "บันทึกฉบับร่างแล้ว", id: data.id };
    }
  } catch (e: any) {
    return { ok: false, message: `เกิดข้อผิดพลาด: ${e.message}` };
  }
}

// สลับสถานะ Published/Draft (ทันที)
export async function toggleProductStatus(id: string, next: boolean): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({ status: next ? "published" : "draft" })
    .eq("id", id);
  if (error) return { ok: false, message: "เปลี่ยนสถานะไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: next ? "เผยแพร่แล้ว" : "เปลี่ยนเป็นฉบับร่างแล้ว" };
}

// กำหนดว่าสินค้านี้อยู่ในแพ็กไหน (tier)
export async function setProductTier(id: string, tier: string | null): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").update({ tier }).eq("id", id);
  if (error) return { ok: false, message: "อัปเดตแพ็กไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: "อัปเดตแพ็กของสินค้าแล้ว" };
}

// ลบสินค้า (ลบบทเรียน/รีวิวที่ผูกอยู่ด้วยผ่าน cascade)
export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: "ลบไม่สำเร็จ: " + error.message };
  refreshAll();
  return { ok: true, message: "ลบสินค้าแล้ว" };
}

// =============================================================
// บทเรียน
// =============================================================
export async function saveLesson(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = (formData.get("id") as string) || null;
  const productId = String(formData.get("product_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, message: "กรุณากรอกชื่อบทเรียน" };

  const fields = {
    product_id: productId,
    title,
    duration_min: Number(formData.get("duration_min") ?? 0),
    bunny_video_id: String(formData.get("bunny_video_id") ?? "") || null,
    is_free_preview: formData.get("is_free_preview") === "on" || formData.get("is_free_preview") === "1",
  };

  if (id) {
    const { error } = await admin.from("course_lessons").update(fields).eq("id", id);
    if (error) return { ok: false, message: "บันทึกไม่สำเร็จ" };
  } else {
    // บทใหม่ต่อท้าย
    const { count } = await admin
      .from("course_lessons")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);
    const { error } = await admin
      .from("course_lessons")
      .insert({ ...fields, sort_order: (count ?? 0) + 1 });
    if (error) return { ok: false, message: "เพิ่มบทเรียนไม่สำเร็จ" };
  }
  revalidatePath(`/admin/products/${productId}/lessons`);
  refreshAll();
  return { ok: true, message: "บันทึกบทเรียนแล้ว" };
}

export async function deleteLesson(id: string, productId: string): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("course_lessons").delete().eq("id", id);
  if (error) return { ok: false, message: "ลบไม่สำเร็จ" };
  revalidatePath(`/admin/products/${productId}/lessons`);
  return { ok: true, message: "ลบบทเรียนแล้ว" };
}

export async function toggleLessonFree(id: string, next: boolean): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("course_lessons").update({ is_free_preview: next }).eq("id", id);
  if (error) return { ok: false, message: "อัปเดตไม่สำเร็จ" };
  return { ok: true, message: next ? "ตั้งเป็นดูฟรีแล้ว" : "ยกเลิกดูฟรีแล้ว" };
}

// บันทึกลำดับบทใหม่หลังลาก-วาง
export async function reorderLessons(productId: string, orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await admin.from("course_lessons").update({ sort_order: i + 1 }).eq("id", orderedIds[i]);
  }
  revalidatePath(`/admin/products/${productId}/lessons`);
  return { ok: true, message: "บันทึกลำดับบทเรียนใหม่แล้ว" };
}

// =============================================================
// แพ็กบุฟเฟต์
// =============================================================
export async function savePlan(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id") ?? "");
  const fields = {
    name: String(formData.get("name") ?? "").trim(),
    price_thb: Number(formData.get("price_thb") ?? 0),
    description: String(formData.get("description") ?? ""),
  };
  if (!fields.name) return { ok: false, message: "กรุณากรอกชื่อแพ็ก" };
  const { error } = await admin.from("subscription_plans").update(fields).eq("id", id);
  if (error) return { ok: false, message: "บันทึกไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: "บันทึกแพ็กแล้ว" };
}

// =============================================================
// รีวิว
// =============================================================
export async function toggleReviewVisible(id: string, next: boolean): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("reviews").update({ is_visible: next }).eq("id", id);
  if (error) return { ok: false, message: "อัปเดตไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: next ? "แสดงรีวิวแล้ว" : "ซ่อนรีวิวแล้ว" };
}

export async function toggleReviewFeatured(id: string, next: boolean): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("reviews").update({ is_featured: next }).eq("id", id);
  if (error) return { ok: false, message: "อัปเดตไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: next ? "ปักหมุดขึ้นหน้าแรกแล้ว" : "เอาออกจากหน้าแรกแล้ว" };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, message: "ลบไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: "ลบรีวิวแล้ว" };
}

// เพิ่มรีวิวใหม่ (รองรับอัปโหลดรูปประกอบ + ผลลัพธ์)
export async function createReview(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const studentName = String(formData.get("student_name") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  if (!studentName || !comment) return { ok: false, message: "กรุณากรอกชื่อและข้อความรีวิว" };

  const fields: Record<string, any> = {
    student_name: studentName,
    school: String(formData.get("school") ?? "") || null,
    rating: Number(formData.get("rating") ?? 5),
    comment,
    result_label: String(formData.get("result_label") ?? "") || null,
    product_id: (formData.get("product_id") as string) || null,
    is_visible: true,
    is_featured: formData.get("is_featured") === "on" || formData.get("is_featured") === "1",
  };

  // อัปโหลดรูปประกอบ (ถ้ามี) ไป bucket portfolio
  const img = formData.get("image") as File | null;
  if (img && img.size > 0) {
    const up = await uploadImage(admin, "portfolio", img, "review");
    if (!up.ok) return { ok: false, message: up.message };
    fields.image_url = up.url;
  }

  const { error } = await admin.from("reviews").insert(fields);
  if (error) return { ok: false, message: "เพิ่มรีวิวไม่สำเร็จ: " + error.message };
  refreshAll();
  return { ok: true, message: "เพิ่มรีวิวแล้ว" };
}

// =============================================================
// ผลงานนักเรียน (portfolio)
// =============================================================

// helper: อัปโหลดรูปไป bucket แล้วคืน public URL (จำกัด 5MB + เฉพาะ jpg/png/webp)
async function uploadImage(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  file: File,
  prefix: string
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return { ok: false, message: "รองรับเฉพาะไฟล์ jpg, png, webp" };
  if (file.size > 5 * 1024 * 1024) return { ok: false, message: "ไฟล์ใหญ่เกิน 5MB" };

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await admin.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) return { ok: false, message: "อัปโหลดรูปไม่สำเร็จ: " + error.message };
  return { ok: true, url: admin.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}

export async function upsertPortfolio(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const fields: Record<string, any> = {
    caption: String(formData.get("caption") ?? "") || null,
    student_name: String(formData.get("student_name") ?? "") || null,
    result_label: String(formData.get("result_label") ?? "") || null,
    product_id: (formData.get("product_id") as string) || null,
  };

  const img = formData.get("image") as File | null;
  if (img && img.size > 0) {
    const up = await uploadImage(admin, "portfolio", img, "portfolio");
    if (!up.ok) return { ok: false, message: up.message };
    fields.image_url = up.url;
  }

  if (id) {
    const { error } = await admin.from("portfolio_posts").update(fields).eq("id", id);
    if (error) return { ok: false, message: "บันทึกไม่สำเร็จ: " + error.message };
    refreshAll();
    return { ok: true, message: "บันทึกการแก้ไขแล้ว" };
  }

  // เพิ่มใหม่ — ต้องมีรูป
  if (!fields.image_url) return { ok: false, message: "กรุณาเลือกรูปภาพ" };
  const { count } = await admin
    .from("portfolio_posts")
    .select("*", { count: "exact", head: true });
  fields.sort_order = (count ?? 0) + 1;
  fields.is_published = true;
  const { error } = await admin.from("portfolio_posts").insert(fields);
  if (error) return { ok: false, message: "เพิ่มรูปไม่สำเร็จ: " + error.message };
  refreshAll();
  return { ok: true, message: "เพิ่มรูปผลงานแล้ว" };
}

export async function togglePortfolioVisible(id: string, next: boolean): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("portfolio_posts").update({ is_published: next }).eq("id", id);
  if (error) return { ok: false, message: "อัปเดตไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: next ? "แสดงรูปแล้ว" : "ซ่อนรูปแล้ว" };
}

export async function deletePortfolio(id: string): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("portfolio_posts").delete().eq("id", id);
  if (error) return { ok: false, message: "ลบไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: "ลบรูปผลงานแล้ว" };
}

export async function reorderPortfolio(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await admin.from("portfolio_posts").update({ sort_order: i + 1 }).eq("id", orderedIds[i]);
  }
  refreshAll();
  return { ok: true, message: "บันทึกลำดับใหม่แล้ว" };
}

// =============================================================
// ตั้งค่าเว็บ (site_settings) — บันทึกทุก field ในฟอร์มเป็น key-value
// =============================================================
export async function saveSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const now = new Date().toISOString();
  const rows: { key: string; value: string; updated_at: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") rows.push({ key, value, updated_at: now });
  }
  if (rows.length === 0) return { ok: false, message: "ไม่มีข้อมูลให้บันทึก" };

  const { error } = await admin.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, message: "บันทึกไม่สำเร็จ: " + error.message };
  refreshAll();
  return { ok: true, message: "บันทึกการตั้งค่าแล้ว" };
}

// =============================================================
// ผู้สอน (instructors)
// =============================================================
function parseTags(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function upsertInstructor(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "กรุณากรอกชื่อผู้สอน" };

  const fields: Record<string, any> = {
    name,
    title: String(formData.get("title") ?? "") || null,
    bio: String(formData.get("bio") ?? "") || null,
    tags: parseTags(String(formData.get("tags") ?? "")),
  };

  const img = formData.get("image") as File | null;
  if (img && img.size > 0) {
    const up = await uploadImage(admin, "thumbnails", img, "instructor");
    if (!up.ok) return { ok: false, message: up.message };
    fields.image_url = up.url;
  }

  if (id) {
    const { error } = await admin.from("instructors").update(fields).eq("id", id);
    if (error) return { ok: false, message: "บันทึกไม่สำเร็จ: " + error.message };
    refreshAll();
    return { ok: true, message: "บันทึกผู้สอนแล้ว" };
  }

  const { count } = await admin.from("instructors").select("*", { count: "exact", head: true });
  fields.sort_order = count ?? 0;
  fields.is_active = true;
  const { error } = await admin.from("instructors").insert(fields);
  if (error) return { ok: false, message: "เพิ่มผู้สอนไม่สำเร็จ: " + error.message };
  refreshAll();
  return { ok: true, message: "เพิ่มผู้สอนแล้ว" };
}

export async function toggleInstructor(id: string, next: boolean): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("instructors").update({ is_active: next }).eq("id", id);
  if (error) return { ok: false, message: "อัปเดตไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: next ? "แสดงผู้สอนแล้ว" : "ซ่อนผู้สอนแล้ว" };
}

export async function deleteInstructor(id: string): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("instructors").delete().eq("id", id);
  if (error) return { ok: false, message: "ลบไม่สำเร็จ" };
  refreshAll();
  return { ok: true, message: "ลบผู้สอนแล้ว" };
}

export async function reorderInstructors(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await admin.from("instructors").update({ sort_order: i }).eq("id", orderedIds[i]);
  }
  refreshAll();
  return { ok: true, message: "บันทึกลำดับผู้สอนแล้ว" };
}
