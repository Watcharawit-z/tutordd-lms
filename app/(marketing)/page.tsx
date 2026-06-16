import Link from "next/link";
import {
  getFeaturedCourses,
  getFeaturedReviews,
  getPublishedProducts,
  getActiveInstructors,
  getSiteSettings,
  getSetting,
} from "@/lib/queries";
import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";
import TrustStrip from "@/components/TrustStrip";
import InstructorCard from "@/components/InstructorCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, reviews, sheets, instructors, settings] = await Promise.all([
    getFeaturedCourses(3),
    getFeaturedReviews(),
    getPublishedProducts("sheet"),
    getActiveInstructors(),
    getSiteSettings(),
  ]);

  const headline = getSetting(settings, "hero_headline", "เตรียมสอบเข้า ม.1 / ม.4 เรียนจริง สอบติดจริง");
  const subheadline = getSetting(settings, "hero_subheadline", "คอร์สออนไลน์และชีทสรุปคณิต–วิทย์");
  const ctaLine = getSetting(settings, "cta_line_url");

  // สถิติจาก settings
  const studentsNum = Number(getSetting(settings, "stat_students", "0")) || 0;
  const stats = [
    { value: `${studentsNum.toLocaleString("th-TH")}+`, label: "นักเรียนสอบติด", sub: "ร.ร.ชั้นนำ" },
    { value: getSetting(settings, "stat_years", "12"), label: "ปีประสบการณ์สอน", sub: "คณิต–วิทย์" },
    { value: getSetting(settings, "stat_rating", "4.9"), label: "คะแนนรีวิวเฉลี่ย", sub: "จากผู้เรียนจริง" },
    { value: `${getSetting(settings, "stat_recommend", "98")}%`, label: "แนะนำต่อเพื่อน", sub: "ความพึงพอใจ" },
  ];

  return (
    <>
      {/* ===== 1) HERO ===== */}
      <section className="relative overflow-hidden bg-brand-950">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(70%_70%_at_75%_15%,#2f68b8_0%,transparent_60%)]" />
        <div className="container-page relative grid gap-12 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="badge w-fit bg-accent-500/90 text-brand-950">
              สถาบันกวดวิชาออนไลน์ · คณิต–วิทย์
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl">
              {headline}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-brand-100">{subheadline}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/courses" className="btn-accent btn-lg">ดูคอร์สเดี่ยว</Link>
              <Link href="/plans" className="btn-ghost btn-lg border-white/30 bg-white/5 text-white hover:bg-white/10">
                ดูแพ็กบุฟเฟต์รายเดือน
              </Link>
              {ctaLine && (
                <a href={ctaLine} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-lg border-white/30 bg-white/5 text-white hover:bg-white/10">
                  ติดต่อทาง Line
                </a>
              )}
            </div>
            <div className="mt-7 flex items-center gap-3 text-sm text-brand-100">
              <StarRating rating={5} size={18} />
              <span>รีวิว 5 ดาว จากผู้เรียนจริง</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">จุดเด่นของเรา</p>
              <ul className="mt-5 space-y-4">
                {[
                  "วิดีโอคุณภาพสูง ดูซ้ำได้ไม่จำกัด",
                  "ติดตามความคืบหน้าการเรียนรายบท",
                  "ชีทสรุป PDF ดาวน์โหลดได้ทันที",
                  "เลือกได้ทั้งซื้อเดี่ยวและแพ็กบุฟเฟต์",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-brand-50">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-500 text-brand-950">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2) ผู้สอน (ขึ้นมาใต้ Hero) ===== */}
      {instructors.length > 0 && (
        <section id="instructor" className="container-page py-16">
          <div className="text-center">
            <p className="eyebrow">ทีมผู้สอน</p>
            <h2 className="section-title mt-2">เรียนกับติวเตอร์ตัวจริง</h2>
          </div>
          <div
            className={`mt-10 grid gap-6 ${
              instructors.length === 1
                ? "mx-auto max-w-xl"
                : instructors.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {instructors.map((ins) => (
              <InstructorCard key={ins.id} instructor={ins} />
            ))}
          </div>
        </section>
      )}

      {/* ===== 3) แถบสถิติ ===== */}
      <section className="border-y border-brand-100 bg-brand-50/60">
        <div className="container-page grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-brand-700">{s.value}</div>
              <div className="mt-1 text-sm font-semibold text-brand-900">{s.label}</div>
              <div className="text-xs text-brand-900/50">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 4) ทำไมต้องเรียนกับเรา ===== */}
      <TrustStrip />

      {/* ===== 5) คอร์สแนะนำ ===== */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">คอร์สยอดนิยม</p>
            <h2 className="section-title mt-2">คอร์สแนะนำ</h2>
          </div>
          <Link href="/courses" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">ดูทั้งหมด →</Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-8 text-center text-sm text-brand-900/50">
            ยังไม่มีคอร์สเด่น — เพิ่มได้ในหน้า Admin
          </p>
        )}
      </section>

      {/* ===== 6) ชีทสรุป ===== */}
      {sheets.length > 0 && (
        <section className="bg-brand-50/60 py-16">
          <div className="container-page">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">อ่านทบทวนก่อนสอบ</p>
                <h2 className="section-title mt-2">ชีทสรุป</h2>
              </div>
              <Link href="/sheets" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">ดูทั้งหมด →</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sheets.slice(0, 3).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== 7) รีวิว ===== */}
      <section id="reviews" className="py-16">
        <div className="container-page">
          <p className="eyebrow text-center">เสียงจากผู้เรียน</p>
          <h2 className="section-title mt-2 text-center">รีวิวจริงจากนักเรียนและผู้ปกครอง</h2>
          {reviews.length > 0 && (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <figure key={r.id} className="flex flex-col rounded-2xl border border-brand-100 bg-white p-7 shadow-card">
                  <div className="flex items-center justify-between">
                    <StarRating rating={r.rating} size={18} />
                    {r.resultLabel && <span className="badge bg-accent-500/15 text-accent-600">{r.resultLabel}</span>}
                  </div>
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrl} alt="" className="mt-4 h-40 w-full rounded-xl object-cover" />
                  )}
                  <blockquote className="mt-4 flex-1 leading-relaxed text-brand-900/80">“{r.comment}”</blockquote>
                  <figcaption className="mt-5 border-t border-brand-100 pt-4">
                    <div className="font-bold text-brand-900">{r.studentName}</div>
                    <div className="text-sm text-brand-700">{r.school}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 8) CTA ปิดท้าย ===== */}
      <section className="bg-brand-900">
        <div className="container-page flex flex-col items-center gap-5 py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">พร้อมเริ่มเตรียมสอบกับเราแล้วหรือยัง?</h2>
          <p className="max-w-xl text-brand-100">เลือกคอร์ส ชีท หรือแพ็กบุฟเฟต์ที่ใช่ ซื้อแล้วเข้าเรียน/ดาวน์โหลดได้ทันที</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="btn-accent btn-lg">เริ่มเรียนเลย</Link>
            <Link href="/plans" className="btn-ghost btn-lg border-white/30 bg-white/5 text-white hover:bg-white/10">ดูแพ็กบุฟเฟต์</Link>
          </div>
        </div>
      </section>
    </>
  );
}
