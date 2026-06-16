"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { upsertProduct } from "../actions";

type Product = {
  id?: string;
  title?: string;
  short_desc?: string;
  description?: string;
  type?: string;
  subject?: string;
  level?: string;
  tier?: string | null;
  price_thb?: number;
  old_price_thb?: number | null;
  pages?: number | null;
  featured?: boolean;
  thumbnail_url?: string | null;
};

const labelCls = "block text-sm font-semibold text-brand-900";
const inputCls =
  "mt-1 w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function ProductForm({ product }: { product?: Product }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { show } = useToast();
  const [pending, setPending] = useState(false);
  const [type, setType] = useState(product?.type ?? "course");

  async function submit(publish: boolean) {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("publish", publish ? "1" : "0");
    setPending(true);
    const res = await upsertProduct(fd);
    setPending(false);
    show(res.message, res.ok ? "success" : "error");
    if (res.ok) router.push("/admin/products");
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="max-w-3xl space-y-6"
    >
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ข้อมูลหลัก</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>ชื่อสินค้า *</label>
            <input name="title" defaultValue={product?.title} required className={inputCls} placeholder="เช่น คณิตศาสตร์ พิชิตสอบเข้า ม.1" />
          </div>
          <div>
            <label className={labelCls}>คำอธิบายสั้น (โชว์บนการ์ด)</label>
            <input name="short_desc" defaultValue={product?.short_desc} className={inputCls} placeholder="สรุปจุดเด่นสั้น ๆ 1 บรรทัด" />
          </div>
          <div>
            <label className={labelCls}>คำอธิบายเต็ม</label>
            <textarea name="description" defaultValue={product?.description} rows={4} className={inputCls} placeholder="รายละเอียดเนื้อหา จุดเด่น เหมาะกับใคร" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ประเภทและหมวดหมู่</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>ประเภท</label>
            <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="course">📹 คอร์สออนไลน์</option>
              <option value="sheet">📄 ชีทสรุป (PDF)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>วิชา</label>
            <select name="subject" defaultValue={product?.subject ?? "คณิตศาสตร์"} className={inputCls}>
              <option value="คณิตศาสตร์">คณิตศาสตร์</option>
              <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>ระดับ</label>
            <select name="level" defaultValue={product?.level ?? "สอบเข้า ม.1"} className={inputCls}>
              <option value="สอบเข้า ม.1">สอบเข้า ม.1</option>
              <option value="สอบเข้า ม.4">สอบเข้า ม.4</option>
              <option value="ม.ต้น">ม.ต้น</option>
              <option value="ม.ปลาย">ม.ปลาย</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>อยู่ในแพ็กบุฟเฟต์</label>
            <select name="tier" defaultValue={product?.tier ?? "both"} className={inputCls}>
              <option value="M1">แพ็ก ม.1 เท่านั้น</option>
              <option value="M4">แพ็ก ม.4 เท่านั้น</option>
              <option value="both">ทั้งสองแพ็ก</option>
              <option value="">ไม่อยู่ในแพ็ก (ซื้อเดี่ยวเท่านั้น)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ราคาและไฟล์</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>ราคาขาย (บาท) *</label>
            <input name="price_thb" type="number" min={0} defaultValue={product?.price_thb ?? 0} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ราคาเดิม (ขีดทับ) — ใส่หรือไม่ก็ได้</label>
            <input name="old_price_thb" type="number" min={0} defaultValue={product?.old_price_thb ?? undefined} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>รูปปก (thumbnail)</label>
            <input name="thumbnail" type="file" accept="image/*" className={inputCls} />
            {product?.thumbnail_url && (
              <p className="mt-1 text-xs text-brand-900/50">มีรูปอยู่แล้ว — อัปใหม่เพื่อแทนที่</p>
            )}
          </div>
          {type === "sheet" && (
            <>
              <div>
                <label className={labelCls}>ไฟล์ PDF ของชีท</label>
                <input name="pdf" type="file" accept="application/pdf" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>จำนวนหน้า</label>
                <input name="pages" type="number" min={0} defaultValue={product?.pages ?? undefined} className={inputCls} />
              </div>
            </>
          )}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-900">
          <input name="featured" type="checkbox" defaultChecked={product?.featured} className="h-4 w-4 rounded border-brand-300" />
          ⭐ แสดงเป็นคอร์สเด่นบนหน้าแรก
        </label>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={pending} onClick={() => submit(false)} className="btn-ghost disabled:opacity-60">
          {pending ? "กำลังบันทึก..." : "💾 บันทึกฉบับร่าง"}
        </button>
        <button type="button" disabled={pending} onClick={() => submit(true)} className="btn-primary disabled:opacity-60">
          {pending ? "กำลังบันทึก..." : "🚀 บันทึกและเผยแพร่"}
        </button>
      </div>
    </form>
  );
}
