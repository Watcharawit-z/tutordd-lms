"use client";

import { thb } from "@/lib/format";

// กราฟเส้นแบบ SVG (ไม่ต้องใช้ไลบรารีนอก) — ใช้แสดงรายได้ย้อนหลัง
// data: [{ label: '1 มิ.ย.', value: 1990 }, ...]
export default function LineChart({
  data,
  height = 220,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-brand-900/40">
        ยังไม่มีข้อมูล
      </div>
    );
  }

  const W = 700;
  const H = height;
  const pad = { top: 16, right: 16, bottom: 28, left: 48 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const x = (i: number) =>
    pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.value)}`).join(" ");
  const area = `${line} L ${x(data.length - 1)} ${pad.top + innerH} L ${x(0)} ${pad.top + innerH} Z`;

  // เส้นกริดแนวนอน 4 เส้น
  const grid = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="กราฟรายได้">
      {grid.map((g) => {
        const gy = pad.top + innerH - g * innerH;
        return (
          <g key={g}>
            <line x1={pad.left} y1={gy} x2={W - pad.right} y2={gy} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pad.left - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {Math.round(max * g).toLocaleString("th-TH")}
            </text>
          </g>
        );
      })}

      <path d={area} fill="#1d4280" fillOpacity="0.08" />
      <path d={line} fill="none" stroke="#1d4280" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r="3" fill="#1d4280" />
          <title>{`${d.label}: ${thb(d.value)}`}</title>
        </g>
      ))}

      {/* แสดง label เฉพาะบางจุดกันชนกัน */}
      {data.map((d, i) =>
        i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {d.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
