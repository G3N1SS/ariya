import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // впереди переезд на свой VPS — сборка должна работать без Vercel
  output: "standalone",
  env: {
    // дата сборки для открытых метрик в футере — вшивается при билде
    NEXT_PUBLIC_BUILD_DATE: new Date().toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  },
  redirects() {
    // главная версия — русская; старый адрес /ru ведём на корень
    return Promise.resolve([
      {
        source: "/ru",
        destination: "/",
        permanent: true,
      },
    ]);
  },
};

export default nextConfig;
