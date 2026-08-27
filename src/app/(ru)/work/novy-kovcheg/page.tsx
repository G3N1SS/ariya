import type { Metadata } from "next";
import CaseKovcheg from "@/components/CaseKovcheg";
import { dict } from "@/lib/dict";
import { caseOg } from "@/lib/og";

const title = "Кейс: Новый Ковчег — АРИЯ";

export const metadata: Metadata = {
  title,
  description: dict.ru.casePageNk.lead,
  alternates: {
    canonical: "/work/novy-kovcheg",
    languages: {
      ru: "/work/novy-kovcheg",
      en: "/en/work/novy-kovcheg",
    },
  },
  ...caseOg({
    title,
    description: dict.ru.casePageNk.lead,
    path: "/work/novy-kovcheg",
    image: "/og/novy-kovcheg.png",
    locale: "ru",
  }),
};

export default function Page() {
  return <CaseKovcheg locale="ru" />;
}
