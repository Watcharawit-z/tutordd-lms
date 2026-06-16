"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { thaiDate } from "@/lib/format";
import { useToast } from "@/components/admin/Toast";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import ConfirmButton from "@/components/admin/ConfirmButton";
import {
  toggleReviewVisible,
  toggleReviewFeatured,
  deleteReview,
  createReview,
} from "../actions";

type Review = {
  id: string;
  studentName: string;
  school: string | null;
  rating: number;
  comment: string;
  productTitle: string;
  imageUrl: string | null;
  resultLabel: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  createdAt: string;
};

const inputCls =
  "mt-1 w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function Stars({ n }: { n: number }) {
  return <span className="text-accent-500">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default function ReviewsTable({
  reviews,
  products,
}: {
  reviews: Review[];
  products: { id: string; title: string }[];
}) {
  const router = useRouter();
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function submitNew(formData: FormData) {
    startTransition(async () => {
      const res = await createReview(formData);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setOpen(true)} className="btn-primary">
          ＋ เพิ่มรีวิว
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center text-brand-900/40">
          ยังไม่มีรีวิว — กด “เพิ่มรีวิว” เพื่อเริ่ม
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border bg-white p-5 shadow-card ${
                r.isVisible ? "border-brand-100" : "border-brand-100 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrl} alt="" className="h-16 w-16 flex-none rounded-xl object-cover" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-brand-900">{r.studentName}</span>
                      <Stars n={r.rating} />
                      {r.resultLabel && (
                        <span className="badge bg-accent-500/15 text-accent-600">{r.resultLabel}</span>
                      )}
                    </div>
                    <p className="text-xs text-brand-900/50">
                      {r.school ? `${r.school} · ` : ""}
                      {r.productTitle} · {thaiDate(r.createdAt)}
                    </p>
                    <p className="mt-2 text-sm text-brand-900/80">“{r.comment}”</p>
                  </div>
                </div>

                <div className="flex flex-none flex-wrap items-center gap-4">
                  <div className="text-center">
                    <p className="mb-1 text-xs text-brand-900/50">แสดงผล</p>
                    <ToggleSwitch checked={r.isVisible} action={(next) => toggleReviewVisible(r.id, next)} onLabel="แสดง" offLabel="ซ่อน" />
                  </div>
                  <div className="text-center">
                    <p className="mb-1 text-xs text-brand-900/50">หน้าแรก</p>
                    <ToggleSwitch checked={r.isFeatured} action={(next) => toggleReviewFeatured(r.id, next)} onLabel="ปักหมุด" offLabel="ปกติ" />
                  </div>
                  <ConfirmButton
                    action={() => deleteReview(r.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    title="ลบรีวิวนี้?"
                    message="แน่ใจไหมว่าต้องการลบรีวิวนี้? ไม่สามารถกู้คืนได้"
                    confirmLabel="ลบเลย"
                    danger
                  >
                    🗑️ ลบ
                  </ConfirmButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่มรีวิว */}
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-brand-900">เพิ่มรีวิวใหม่</h3>
            <form action={submitNew} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-900">ชื่อผู้รีวิว *</label>
                <input name="student_name" required className={inputCls} placeholder="เช่น น้องปุ๊กกี้" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-brand-900">โรงเรียน/สถานะ</label>
                  <input name="school" className={inputCls} placeholder="เช่น ผู้ปกครอง" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-900">คะแนน</label>
                  <select name="rating" defaultValue="5" className={inputCls}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} ดาว</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">ผลลัพธ์ (ถ้ามี)</label>
                <input name="result_label" className={inputCls} placeholder="เช่น สอบติด ม.4 เตรียมอุดมฯ" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">ข้อความรีวิว *</label>
                <textarea name="comment" required rows={3} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">เกี่ยวกับคอร์ส (ถ้ามี)</label>
                <select name="product_id" defaultValue="" className={inputCls}>
                  <option value="">— รีวิวรวม (หน้าแรก) —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">รูปประกอบ (ถ้ามี)</label>
                <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={inputCls} />
                <p className="mt-1 text-xs text-brand-900/45">รองรับ jpg, png, webp · ไม่เกิน 5MB</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-brand-900">
                <input name="is_featured" type="checkbox" className="h-4 w-4 rounded border-brand-300" />
                ⭐ ปักหมุดขึ้นหน้าแรกทันที
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">ยกเลิก</button>
                <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
                  {pending ? "กำลังบันทึก..." : "บันทึกรีวิว"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
