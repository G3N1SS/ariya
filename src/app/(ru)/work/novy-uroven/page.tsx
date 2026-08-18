import type { Metadata } from "next";
import CaseNovy from "@/components/CaseNovy";
import { dict } from "@/lib/dict";

export const metadata: Metadata = {
  title: "Кейс: Новый уровень — АРИЯ",
  description: dict.ru.casePage.lead,
  alternates: {
    canonical: "/work/novy-uroven",
    languages: {
      ru: "/work/novy-uroven",
      en: "/en/work/novy-uroven",
    },
  },
};

export default function Page() {
  return <CaseNovy locale="ru" />;
}
