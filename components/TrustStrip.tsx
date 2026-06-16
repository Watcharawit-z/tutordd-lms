// แถบสร้างความเชื่อมั่น (trust strip) ใต้ hero — ไอคอน + จุดเด่นสั้น ๆ
const items = [
  {
    title: "เรียนซ้ำไม่จำกัด",
    desc: "ดูคอร์สที่ซื้อได้ตลอดชีพ ทบทวนกี่รอบก็ได้",
    icon: (
      <path d="M3 12a9 9 0 1015.5-6.3M3 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "สอบติดจริง",
    desc: "นักเรียนกว่า 1,200 คนสอบติดโรงเรียนชั้นนำ",
    icon: (
      <path d="M5 21l2.5-6.5M19 21l-2.5-6.5M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4L7 16.7l.9-5L4.3 8.2l5-.7L12 3z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "เข้าเรียนทันที",
    desc: "ซื้อแล้วเข้าดู/ดาวน์โหลดได้เลย ไม่ต้องรอ",
    icon: (
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "ชำระเงินปลอดภัย",
    desc: "PromptPay / บัตรเครดิต ผ่านระบบ Stripe",
    icon: (
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-brand-100 bg-white">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {it.icon}
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-brand-900">{it.title}</p>
              <p className="mt-0.5 text-sm leading-snug text-brand-900/55">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
