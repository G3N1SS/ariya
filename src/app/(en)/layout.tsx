import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { fontVars } from "@/lib/fonts";
import { dict } from "@/lib/dict";
import { SITE_URL } from "@/lib/site";
import { THEME_BOOT } from "@/lib/theme";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: dict.en.meta.title,
  description: dict.en.meta.description,
  alternates: {
    canonical: "/en",
    languages: { ru: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    title: dict.en.meta.title,
    description: dict.en.meta.description,
    url: "/en",
    siteName: "ARIYA",
    locale: "en_US",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: dict.en.meta.title,
    description: dict.en.meta.description,
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ARIYA",
  alternateName: "АРИЯ",
  url: `${SITE_URL}/en`,
  logo: `${SITE_URL}/icon.svg`,
  description: dict.en.meta.description,
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
    <html lang="en" className={fontVars} suppressHydrationWarning>
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
      </body>
    </html>
  );
}
