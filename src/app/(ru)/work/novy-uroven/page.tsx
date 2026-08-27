import type { Metadata } from "next";
import CaseNovy from "@/components/CaseNovy";
import { dict } from "@/lib/dict";
import { caseOg } from "@/lib/og";

const title = "Кейс: Новый уровень — АРИЯ";

export const metadata: Metadata = {
  title,
  description: dict.ru.casePage.lead,
  alternates: {
    canonical: "/work/novy-uroven",
    languages: {
      ru: "/work/novy-uroven",
      en: "/en/work/novy-uroven",
    },
  },
  ...caseOg({
    title,
    description: dict.ru.casePage.lead,
    path: "/work/novy-uroven",
    image: "/og/novy-uroven.png",
    locale: "ru",
  }),
};

export default function Page() {
  return <CaseNovy locale="ru" />;
}
