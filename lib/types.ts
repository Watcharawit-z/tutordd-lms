// =============================================================
// Type กลางของทั้งแอป (ฝั่ง UI ใช้ camelCase)
// queries.ts จะ map row จาก DB (snake_case) มาเป็น type พวกนี้
// =============================================================

export type ProductType = "course" | "sheet";
export type ProductStatus = "published" | "draft";
export type Tier = "M1" | "M4" | "both" | null;
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "unpaid";

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
  isFreePreview: boolean;
  sortOrder: number;
}

export interface Review {
  id: string;
  productId: string | null;
  studentName: string;
  school: string | null;
  rating: number;
  comment: string;
  imageUrl: string | null;
  resultLabel: string | null;
}

export interface Instructor {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  imageUrl: string | null;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
}

// ค่าตั้งค่าเว็บแบบ key-value (อ่านด้วย getSetting)
export type SiteSettings = Record<string, string>;

export interface PortfolioPost {
  id: string;
  imageUrl: string;
  caption: string | null;
  studentName: string | null;
  resultLabel: string | null;
  productId: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface Product {
  id: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  title: string;
  subject: string;
  level: string;
  shortDesc: string;
  description: string;
  priceTHB: number;
  oldPriceTHB: number | null;
  coverColor: string;
  pages: number | null;
  tier: Tier;
  featured: boolean;
  lessons: Lesson[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: "M1" | "M4";
  priceTHB: number;
  stripePriceId: string | null;
  description: string | null;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  tier: "M1" | "M4";
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

// แปลงเป็นสตริงเงินบาท
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ป้ายกำกับ tier เป็นภาษาไทย
export function tierLabel(tier: Tier): string | null {
  if (tier === "M1") return "อยู่ในแพ็ก ม.1";
  if (tier === "M4") return "อยู่ในแพ็ก ม.4";
  if (tier === "both") return "อยู่ในแพ็ก ม.1 และ ม.4";
  return null;
}
