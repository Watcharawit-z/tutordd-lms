import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">ไม่พบหน้าที่คุณค้นหา</h1>
      <p className="mt-2 text-sm text-brand-900/60">
        หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง
      </p>
      <Link href="/" className="btn-primary mt-6">กลับหน้าแรก</Link>
    </div>
  );
}
