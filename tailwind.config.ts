import type { Config } from "tailwindcss";

// ดีไซน์โทน "Trust-academic" — น้ำเงินเข้ม + ขาว เน้นความน่าเชื่อถือแบบสถาบันจริง
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // สีหลักของแบรนด์ (navy)
        brand: {
          50: "#eef4fb",
          100: "#d8e6f6",
          200: "#b3cdee",
          300: "#84ade1",
          400: "#5187cf",
          500: "#2f68b8",
          600: "#23529c",
          700: "#1d4280", // primary
          800: "#173461",
          900: "#122845",
          950: "#0b182b",
        },
        // สีรอง (ทองอ่อน) ใช้เน้น CTA / สถิติ
        accent: {
          400: "#f4c552",
          500: "#eab308",
          600: "#ca9a04",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-thai)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(18,40,69,0.08), 0 8px 24px rgba(18,40,69,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
