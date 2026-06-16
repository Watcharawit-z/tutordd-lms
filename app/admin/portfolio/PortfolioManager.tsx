"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { upsertPortfolio, togglePortfolioVisible, deletePortfolio, reorderPortfolio } from "../actions";

type Post = {
  id: string;
  imageUrl: string;
  caption: string;
  studentName: string;
  resultLabel: string;
  productId: string | null;
  sortOrder: number;
  isPublished: boolean;
};

const inputCls =
  "mt-1 w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function PortfolioManager({
  posts,
  products,
}: {
  posts: Post[];
  products: { id: string; title: string }[];
}) {
  const router = useRouter();
  const { show } = useToast();
  const [list, setList] = useState(posts);
  const [dirty, setDirty] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [modal, setModal] = useState<null | Post | "new">(null);
  const [pending, startTransition] = useTransition();

  function onDrop(target: number) {
    if (dragIdx === null || dragIdx === target) return;
    const next = [...list];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(target, 0, moved);
    setList(next);
    setDirty(true);
    setDragIdx(null);
  }

  function saveOrder() {
    startTransition(async () => {
      const res = await reorderPortfolio(list.map((p) => p.id));
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setDirty(false);
        router.refresh();
      }
    });
  }

  function submitModal(formData: FormData) {
    startTransition(async () => {
      const res = await upsertPortfolio(formData);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setModal(null);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-900/60">ลากรูปเพื่อเรียงลำดับ · กดรูปเพื่อแก้ไข</p>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={saveOrder} disabled={pending} className="btn-accent disabled:opacity-60">
              {pending ? "กำลังบันทึก..." : "💾 บันทึกลำดับ"}
            </button>
          )}
          <button onClick={() => setModal("new")} className="btn-primary">
            ＋ เพิ่มรูป
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-12 text-center text-brand-900/40">
          ยังไม่มีรูปผลงาน — กด “เพิ่มรูป” เพื่อเริ่ม
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {list.map((p, i) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={`overflow-hidden rounded-2xl border bg-white shadow-card ${
                p.isPublished ? "border-brand-100" : "border-brand-100 opacity-60"
              }`}
            >
              <button
                type="button"
                onClick={() => setModal(p)}
                className="relative block aspect-square w-full cursor-pointer bg-brand-100"
                title="กดเพื่อแก้ไข · ลากเพื่อย้าย"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.caption || "ผลงาน"} className="h-full w-full object-cover" />
                {p.resultLabel && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold text-brand-950">
                    {p.resultLabel}
                  </span>
                )}
              </button>
              <div className="flex items-center justify-between gap-2 p-3">
                <ToggleSwitch
                  checked={p.isPublished}
                  action={(next) => togglePortfolioVisible(p.id, next)}
                  onLabel="แสดง"
                  offLabel="ซ่อน"
                />
                <ConfirmButton
                  action={() => deletePortfolio(p.id)}
                  className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  title="ลบรูปนี้?"
                  message="แน่ใจไหมว่าต้องการลบรูปผลงานนี้? ไม่สามารถกู้คืนได้"
                  confirmLabel="ลบเลย"
                  danger
                >
                  🗑️ ลบ
                </ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไข */}
      {modal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-brand-900">
              {modal === "new" ? "เพิ่มรูปผลงาน" : "แก้ไขรูปผลงาน"}
            </h3>
            <form action={submitModal} className="mt-4 space-y-4">
              {modal !== "new" && <input type="hidden" name="id" value={modal.id} />}

              {modal !== "new" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={modal.imageUrl} alt="" className="h-40 w-full rounded-xl object-cover" />
              )}
              <div>
                <label className="block text-sm font-semibold text-brand-900">
                  รูปภาพ {modal === "new" ? "*" : "(อัปใหม่เพื่อแทนที่)"}
                </label>
                <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={inputCls} required={modal === "new"} />
                <p className="mt-1 text-xs text-brand-900/45">รองรับ jpg, png, webp · ไม่เกิน 5MB</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">ชื่อนักเรียน</label>
                <input name="student_name" defaultValue={modal === "new" ? "" : modal.studentName} className={inputCls} placeholder="เช่น น้องเจ" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">ผลลัพธ์</label>
                <input name="result_label" defaultValue={modal === "new" ? "" : modal.resultLabel} className={inputCls} placeholder="เช่น สอบติด ร.ร.เตรียมอุดมฯ" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">คำบรรยาย (caption)</label>
                <textarea name="caption" rows={2} defaultValue={modal === "new" ? "" : modal.caption} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-900">เกี่ยวกับคอร์ส (ถ้ามี)</label>
                <select name="product_id" defaultValue={modal === "new" ? "" : modal.productId ?? ""} className={inputCls}>
                  <option value="">— ไม่ระบุ —</option>
                  {products.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-ghost">ยกเลิก</button>
                <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
                  {pending ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
