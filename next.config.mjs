/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // อนุญาตโหลดรูปจาก CDN ภายนอก (เช่น Bunny / Supabase Storage) ในเฟสถัดไป
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
