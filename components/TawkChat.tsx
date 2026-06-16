"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function TawkChat({ id }: { id: string }) {
  const pathname = usePathname();
  const hide = pathname.startsWith("/admin") || pathname.startsWith("/learn");
  if (!id || hide) return null;

  return (
    <Script
      id="tawkto"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/${id}';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
