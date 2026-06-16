// =============================================================
// ตัวช่วยจัดรูปแบบ เงิน/วันที่ เป็นภาษาไทย (พ.ศ.)
// ใช้ทั้งฝั่ง server และ client
// =============================================================

// ฿1,990
export function thb(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

// 17 มิถุนายน 2569
export function thaiDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

// 17 มิ.ย. 2569 15:30 น.
export function thaiDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const date = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${date} ${time} น.`;
}

// เวลาผ่านมาแบบสั้น ๆ เช่น "5 นาทีที่แล้ว"
export function thaiRelative(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "เมื่อสักครู่";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} วันที่แล้ว`;
  return thaiDate(d);
}
