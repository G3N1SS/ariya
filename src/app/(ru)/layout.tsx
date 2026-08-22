import Metrika from "@/components/fx/Metrika";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { fontVars } from "@/lib/fonts";
import { dict } from "@/lib/dict";
import { SITE_URL } from "@/lib/site";
import { THEME_BOOT } from "@/lib/theme";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: dict.ru.meta.title,
  description: dict.ru.meta.description,
  alternates: {
    canonical: "/",
    languages: { ru: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    title: dict.ru.meta.title,
    description: dict.ru.meta.description,
    url: "/",
    siteName: "АРИЯ",
    locale: "ru_RU",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: dict.ru.meta.title,
    description: dict.ru.meta.description,
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "АРИЯ",
  alternateName: "ARIYA",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: dict.ru.meta.description,
};

export const viewport: Viewport = {
  // пара media-тегов: браузер красит свою шапку по системной теме ещё до JS;
  // явный выбор темы перекрашивает оба тега скриптом (lib/theme.ts)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090c22" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // suppressHydrationWarning: data-theme ставит буст-скрипт до гидрации —
  // для React это ожидаемое расхождение с SSR-снимком
  return (
    <html lang="ru" className={fontVars} suppressHydrationWarning>
      <body>
        {/* тема применяется до гидрации — без мигания белым */}
        <Script
          id="ariya-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT }}
        />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Metrika />
      </body>
    </html>
  );
}
