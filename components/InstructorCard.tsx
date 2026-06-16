import type { Instructor } from "@/lib/types";

// การ์ดผู้สอน: รูปวงกลมใหญ่กลางการ์ด → ชื่อ → ตำแหน่ง → tags (badge) → ประวัติ
export default function InstructorCard({ instructor }: { instructor: Instructor }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-card">
      {instructor.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={instructor.imageUrl}
          alt={instructor.name}
          className="h-[120px] w-[120px] rounded-full object-cover"
        />
      ) : (
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-5xl font-extrabold text-white">
          {instructor.name.charAt(0)}
        </div>
      )}

      <h3 className="mt-5 text-xl font-extrabold text-brand-900">{instructor.name}</h3>
      {instructor.title && <p className="mt-1 text-sm font-medium text-brand-900/55">{instructor.title}</p>}

      {instructor.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {instructor.tags.map((t) => (
            <li key={t} className="badge bg-brand-50 text-brand-700">{t}</li>
          ))}
        </ul>
      )}

      {instructor.bio && (
        <p className="mt-4 text-sm leading-relaxed text-brand-900/65">{instructor.bio}</p>
      )}
    </div>
  );
}
