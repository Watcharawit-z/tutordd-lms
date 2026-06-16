"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import ConfirmButton from "@/components/admin/ConfirmButton";
import {
  saveSettings,
  upsertInstructor,
  toggleInstructor,
  deleteInstructor,
  reorderInstructors,
} from "../actions";

type Settings = Record<string, string>;
type Instructor = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string | null;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
};

const inputCls =
  "mt-1 w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelCls = "block text-sm font-semibold text-brand-900";

function Field({ name, label, def, hint, type = "text" }: { name: string; label: string; def: string; hint?: string; type?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input name={name} type={type} defaultValue={def} className={inputCls} />
      {hint && <p className="mt-1 text-xs text-brand-900/45">{hint}</p>}
    </div>
  );
}

/* ---------------- Tab 1: ข้อมูลทั่วไป ---------------- */
function GeneralForm({ s }: { s: Settings }) {
  const { show } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await saveSettings(formData);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }
  return (
    <form action={submit} className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ชื่อและคำอธิบายเว็บ</h2>
        <div className="mt-4 space-y-4">
          <Field name="site_name" label="ชื่อเว็บ" def={s.site_name ?? ""} />
          <Field name="site_tagline" label="คำอธิบายเว็บ (tagline)" def={s.site_tagline ?? ""} />
        </div>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ข้อความ Hero (หน้าแรก)</h2>
        <div className="mt-4 space-y-4">
          <Field name="hero_headline" label="หัวข้อใหญ่" def={s.hero_headline ?? ""} />
          <Field name="hero_subheadline" label="คำอธิบายใต้หัวข้อ" def={s.hero_subheadline ?? ""} />
        </div>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ตัวเลขสถิติ (แถบหน้าแรก)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field name="stat_students" label="จำนวนนักเรียน" def={s.stat_students ?? ""} hint="ใส่ตัวเลข เช่น 1200 (เว็บจะแสดง 1,200+)" />
          <Field name="stat_years" label="ปีประสบการณ์" def={s.stat_years ?? ""} />
          <Field name="stat_rating" label="คะแนนรีวิว" def={s.stat_rating ?? ""} hint="เช่น 4.9" />
          <Field name="stat_recommend" label="% แนะนำต่อ" def={s.stat_recommend ?? ""} hint="ใส่ตัวเลข เช่น 98 (แสดง 98%)" />
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? "กำลังบันทึก..." : "💾 บันทึกข้อมูลทั่วไป"}
      </button>
    </form>
  );
}

/* ---------------- Tab 2: ติดต่อและโซเชียล ---------------- */
function ContactForm({ s }: { s: Settings }) {
  const { show } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await saveSettings(formData);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }
  return (
    <form action={submit} className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">ช่องทางติดต่อ</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field name="contact_line" label="Line ID" def={s.contact_line ?? ""} hint="เช่น @tutordd" />
          <Field name="social_line_url" label="Line URL" def={s.social_line_url ?? ""} hint="ลิงก์เพิ่มเพื่อน" />
          <Field name="contact_phone" label="เบอร์โทร" def={s.contact_phone ?? ""} />
          <Field name="contact_email" label="อีเมล" def={s.contact_email ?? ""} />
          <Field name="contact_hours" label="เวลาทำการ" def={s.contact_hours ?? ""} />
          <Field name="cta_line_url" label="ปุ่ม CTA Line URL" def={s.cta_line_url ?? ""} />
        </div>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">โซเชียลมีเดีย</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field name="social_facebook" label="Facebook URL" def={s.social_facebook ?? ""} />
          <Field name="social_tiktok" label="TikTok URL" def={s.social_tiktok ?? ""} />
          <Field name="social_youtube" label="YouTube URL" def={s.social_youtube ?? ""} />
        </div>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-900">แชทสด (Tawk.to)</h2>
        <div className="mt-4">
          <Field
            name="tawk_id"
            label="Tawk.to Property ID"
            def={s.tawk_id ?? ""}
            hint="คัดลอกจาก Tawk.to → Admin → Channels → Chat Widget (รูปแบบ xxxxxxxx/yyyyyyy) · บันทึกแล้วแชทจะขึ้นทันทีบนหน้าเว็บ"
          />
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? "กำลังบันทึก..." : "💾 บันทึกข้อมูลติดต่อ"}
      </button>
    </form>
  );
}

/* ---------------- Tab 3: ผู้สอน ---------------- */
function InstructorsManager({ initial }: { initial: Instructor[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [list, setList] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [modal, setModal] = useState<null | Instructor | "new">(null);
  const [preview, setPreview] = useState<string | null>(null);
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
      const res = await reorderInstructors(list.map((i) => i.id));
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setDirty(false);
        router.refresh();
      }
    });
  }
  function submitModal(formData: FormData) {
    startTransition(async () => {
      const res = await upsertInstructor(formData);
      show(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setModal(null);
        setPreview(null);
        router.refresh();
      }
    });
  }
  function openModal(m: Instructor | "new") {
    setPreview(m === "new" ? null : m.imageUrl);
    setModal(m);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-900/60">ลากการ์ดเพื่อเรียงลำดับ · กดเพื่อแก้ไข</p>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={saveOrder} disabled={pending} className="btn-accent disabled:opacity-60">
              {pending ? "กำลังบันทึก..." : "💾 บันทึกลำดับ"}
            </button>
          )}
          <button onClick={() => openModal("new")} className="btn-primary">＋ เพิ่มผู้สอน</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center text-brand-900/40">
          ยังไม่มีผู้สอน — กด “เพิ่มผู้สอน”
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((ins, i) => (
            <div
              key={ins.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-card ${ins.isActive ? "border-brand-100" : "border-brand-100 opacity-60"}`}
            >
              <div className="flex-none">
                {ins.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ins.imageUrl} alt={ins.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                    {ins.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-brand-900">{ins.name}</p>
                <p className="text-xs text-brand-900/55">{ins.title}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => openModal(ins)} className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">✏️ แก้ไข</button>
                  <ConfirmButton
                    action={() => deleteInstructor(ins.id)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    title="ลบผู้สอนนี้?"
                    message="แน่ใจไหมว่าต้องการลบผู้สอนนี้? ไม่สามารถกู้คืนได้"
                    confirmLabel="ลบเลย"
                    danger
                  >
                    🗑️ ลบ
                  </ConfirmButton>
                </div>
              </div>
              <div className="flex-none">
                <ToggleSwitch checked={ins.isActive} action={(next) => toggleInstructor(ins.id, next)} onLabel="แสดง" offLabel="ซ่อน" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-brand-900">{modal === "new" ? "เพิ่มผู้สอน" : "แก้ไขผู้สอน"}</h3>
            <form action={submitModal} className="mt-4 space-y-4">
              {modal !== "new" && <input type="hidden" name="id" value={modal.id} />}

              <div className="flex flex-col items-center">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-28 w-28 rounded-full object-cover" />
                ) : (
                  <span className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
                    {(modal === "new" ? "?" : modal.name.charAt(0))}
                  </span>
                )}
                <label className="mt-3 cursor-pointer text-sm font-semibold text-brand-700 hover:underline">
                  เลือกรูปโปรไฟล์
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPreview(URL.createObjectURL(f));
                    }}
                  />
                </label>
                <p className="text-xs text-brand-900/45">jpg, png, webp · ไม่เกิน 5MB</p>
              </div>

              <div>
                <label className={labelCls}>ชื่อ *</label>
                <input name="name" required defaultValue={modal === "new" ? "" : modal.name} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ตำแหน่ง</label>
                <input name="title" defaultValue={modal === "new" ? "" : modal.title} className={inputCls} placeholder="เช่น ผู้ก่อตั้ง · ติวเตอร์คณิต–วิทย์" />
              </div>
              <div>
                <label className={labelCls}>ดีกรี/tags (คั่นด้วยขึ้นบรรทัดใหม่หรือจุลภาค)</label>
                <textarea name="tags" rows={3} defaultValue={modal === "new" ? "" : modal.tags.join("\n")} className={inputCls} placeholder={"ปริญญาโท วิทยาศาสตร์\nติวเตอร์มืออาชีพ 12 ปี"} />
              </div>
              <div>
                <label className={labelCls}>ประวัติย่อ (bio)</label>
                <textarea name="bio" rows={3} defaultValue={modal === "new" ? "" : modal.bio} className={inputCls} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setModal(null); setPreview(null); }} className="btn-ghost">ยกเลิก</button>
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

/* ---------------- Tabs container ---------------- */
export default function SettingsTabs({
  settings,
  instructors,
}: {
  settings: Settings;
  instructors: Instructor[];
}) {
  const [tab, setTab] = useState(0);
  const tabs = ["ข้อมูลทั่วไป", "ติดต่อและโซเชียล", "ผู้สอน"];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              tab === i ? "bg-brand-700 text-white" : "bg-white text-brand-700 hover:bg-brand-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <GeneralForm s={settings} />}
      {tab === 1 && <ContactForm s={settings} />}
      {tab === 2 && <InstructorsManager initial={instructors} />}
    </div>
  );
}
