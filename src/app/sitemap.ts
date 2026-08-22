import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // одна запись на кейс-страницу в каждой локали, hreflang через alternates
  const casePages = ["novy-uroven", "novy-kovcheg"].flatMap((slug) => {
    const langs = {
      ru: `${SITE_URL}/work/${slug}`,
      en: `${SITE_URL}/en/work/${slug}`,
    };
    return [
      { url: langs.ru, lastModified: now, alternates: { languages: langs } },
      { url: langs.en, lastModified: now, alternates: { languages: langs } },
    ];
  });
  return [
    {
      url: SITE_URL,
      lastModified: now,
      alternates: { languages: { ru: SITE_URL, en: `${SITE_URL}/en` } },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: now,
      alternates: { languages: { ru: SITE_URL, en: `${SITE_URL}/en` } },
    },
    ...casePages,
  ];
}
