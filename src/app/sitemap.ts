import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
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
    {
      url: `${SITE_URL}/work/novy-uroven`,
      lastModified: now,
      alternates: {
        languages: {
          ru: `${SITE_URL}/work/novy-uroven`,
          en: `${SITE_URL}/en/work/novy-uroven`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/work/novy-uroven`,
      lastModified: now,
      alternates: {
        languages: {
          ru: `${SITE_URL}/work/novy-uroven`,
          en: `${SITE_URL}/en/work/novy-uroven`,
        },
      },
    },
  ];
}
