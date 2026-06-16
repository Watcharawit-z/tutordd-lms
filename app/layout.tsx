import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import TawkChatLoader from "@/components/TawkChatLoader";

// ฟอนต์ไทยอ่านง่าย ดูเป็นทางการ
const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tutor DD | กวดวิชาคณิต–วิทย์ ออนไลน์ เตรียมสอบเข้า ม.1 / ม.4",
    template: "%s | Tutor DD",
  },
  description:
    "สถาบันกวดวิชาออนไลน์ คณิต–วิทย์ เตรียมสอบเข้า ม.1 และ ม.4 เรียนซ้ำได้ไม่จำกัด พร้อมชีทสรุปดาวน์โหลดได้ทันที",
};

// Root layout: ใส่แค่ html/body/ฟอนต์ — โครง Navbar/Footer อยู่ใน layout ของแต่ละกลุ่ม
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={notoThai.variable}>
      <body className="bg-white font-sans text-brand-900">
        {children}
        <TawkChatLoader />
      </body>
    </html>
  );
}
