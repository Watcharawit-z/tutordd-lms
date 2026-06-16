import { requireAdmin, getStudents } from "@/lib/admin";
import StudentsTable from "./StudentsTable";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  await requireAdmin();
  const students = await getStudents();
  return (
    <div>
      <p className="mb-6 text-brand-900/60">รายชื่อนักเรียนทั้งหมด กดที่ชื่อเพื่อดูรายละเอียดการซื้อและความคืบหน้า</p>
      <StudentsTable students={students} />
    </div>
  );
}
