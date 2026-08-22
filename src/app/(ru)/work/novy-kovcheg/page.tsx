import type { Metadata } from "next";
import CaseKovcheg from "@/components/CaseKovcheg";
import { dict } from "@/lib/dict";

export const metadata: Metadata = {
  title: "Кейс: Новый Ковчег — АРИЯ",
  description: dict.ru.casePageNk.lead,
  alternates: {
    canonical: "/work/novy-kovcheg",
    languages: {
      ru: "/work/novy-kovcheg",
      en: "/en/work/novy-kovcheg",
    },
  },
};

export default function Page() {
  return <CaseKovcheg locale="ru" />;
}
