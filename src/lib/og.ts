import type { Metadata } from "next";

// OG-блок кейсовых страниц: без него шарилка наследует мету главной —
// чужой заголовок и знак /// вместо кейса. Картинка одна на кейс,
// локали делят её, а заголовок/описание берут свои.
export function caseOg(o: {
  title: string;
  description: string;
  path: string;
  image: string;
  locale: "ru" | "en";
}) {
  return {
    openGraph: {
      title: o.title,
      description: o.description,
      url: o.path,
      siteName: o.locale === "ru" ? "АРИЯ" : "ARIYA",
      locale: o.locale === "ru" ? "ru_RU" : "en_US",
      type: "website",
      images: [{ url: o.image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: o.title,
      description: o.description,
      images: [o.image],
    },
  } satisfies Partial<Metadata>;
}
