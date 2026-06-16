"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { saveLesson, deleteLesson, toggleLessonFree, reorderLessons } from "../../../actions";

type Lesson = {
  id: string;
  title: string;
  duration_min: number;
  bunny_video_id: string | null;
  is_free_preview: boolean;
  finishedCount: number;
  finishedPct: number;
};

const inputCls =
  "mt-1 w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function LessonsManager({
  productId,
  initial,
}: {
  productId: string;
  initial: Lesson[];
}) {
  const router = useRouter();
  const { show } = useToast();
  const [list, setList] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [modal, setModal] = useState<null | Lesson | "new">(null);
  const [pending, startTransition] = useTransition();

  // ---- drag & drop เรียงลำดับ ----
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
      const res = await reorderLessons(productId, list.map((l) => l.id));
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setDirty(false);
        router.refresh();
      }
    });
  }

  // ---- เพิ่ม/แก้ไข ----
  function submitModal(formData: FormData) {
    startTransition(async () => {
      const res = await saveLesson(formData);
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
        <p className="text-sm text-brand-900/60">ลากการ์ดเพื่อเรียงลำดับ · กดปุ่มเพื่อเพิ่ม/แก้ไขบท</p>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={saveOrder} disabled={pending} className="btn-accent disabled:opacity-60">
              {pending ? "กำลังบันทึก..." : "💾 บันทึกลำดับ"}
            </button>
          )}
          <button onClick={() => setModal("new")} className="btn-primary">
            ＋ เพิ่มบทเรียน
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center text-brand-900/40">
          ยังไม่มีบทเรียน — กด “เพิ่มบทเรียน” เพื่อเริ่ม
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((l, i) => (
            <li
              key={l.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-card sm:flex-row sm:items-center"
            >
              <span className="cursor-grab select-none text-brand-300" title="ลากเพื่อย้าย">
                ⠿
              </span>
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-900">{l.title}</p>
                <p className="text-xs text-brand-900/50">
                  {l.duration_min} นาที
                  {l.bunny_video_id ? ` · วิดีโอ: ${l.bunny_video_id}` : " · ยังไม่ใส่วิดีโอ"}
                </p>
                <p className="mt-0.5 text-xs text-brand-700">
                  ดูจบแล้ว {l.finishedCount} คน ({l.finishedPct}% ของผู้ซื้อ)
                </p>
              </div>
              <ToggleSwitch
                checked={l.is_free_preview}
                action={(next) => toggleLessonFree(l.id, next)}
                onLabel="ดูฟรี"
                offLabel="ล็อก"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => setModal(l)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  ✏️ แก้ไข
                </button>
                <ConfirmButton
                  action={() => deleteLesson(l.id, productId)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  title="ลบบทเรียนนี้?"
                  message="แน่ใจไหมว่าต้องการลบบทเรียนนี้? ไม่สามารถกู้คืนได้"
                  confirmLabel="ลบเลย"
                  danger
                >
                  🗑️ ลบ
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal เพิ่ม/แก้ไข */}
      {modal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-brand-900">
              {modal === "new" ? "เพิ่มบทเรียนใหม่" : "แก้ไขบทเรียน"}
            </h3>
            <form action={submitModal} className="mt-4 space-y-4">
              <input type="hidden" name="product_id" value={productId} />
              {modal !== "new" && <input type="hidden" name="id" value={modal.id} />}
              <div>
                <label className="block text-sm font-semibold text-brand-900">ชื่อบทเรียน *</label>
                <input name="title" required defaultValue={modal === "new" ? "" : modal.title} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-brand-900">ระยะเวลา (นาที)</label>
                  <input name="duration_min" type="number" min={0} defaultValue={modal === "new" ? 0 : modal.duration_min} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-900">Bunny Video ID</label>
                  <input name="bunny_video_id" defaultValue={modal === "new" ? "" : modal.bunny_video_id ?? ""} className={inputCls} placeholder="ใส่ภายหลังได้" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-brand-900">
                <input name="is_free_preview" type="checkbox" defaultChecked={modal !== "new" && modal.is_free_preview} className="h-4 w-4 rounded border-brand-300" />
                เปิดให้ดูฟรี (ตัวอย่าง)
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-ghost">
                  ยกเลิก
                </button>
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
