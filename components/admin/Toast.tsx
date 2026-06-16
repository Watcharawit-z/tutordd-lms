"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{
  show: (message: string, type?: ToastType) => void;
} | null>(null);

// hook สำหรับเรียก toast จากที่ไหนก็ได้ (ภายใต้ ToastProvider)
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast ต้องอยู่ภายใต้ <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const styles: Record<ToastType, string> = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-brand-700",
  };
  const icons: Record<ToastType, React.ReactNode> = {
    success: <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />,
    error: <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />,
    info: <path d="M10 9v5M10 6h.01" strokeLinecap="round" />,
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg ${styles[t.type]}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4">
              {icons[t.type]}
            </svg>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
