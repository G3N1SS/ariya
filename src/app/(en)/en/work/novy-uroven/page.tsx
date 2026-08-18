import type { Metadata } from "next";
import CaseNovy from "@/components/CaseNovy";
import { dict } from "@/lib/dict";

export const metadata: Metadata = {
  title: "Case study: Novy Uroven — ARIYA",
  description: dict.en.casePage.lead,
  alternates: {
    canonical: "/en/work/novy-uroven",
    languages: {
      ru: "/work/novy-uroven",
      en: "/en/work/novy-uroven",
    },
  },
};

export default function Page() {
  return <CaseNovy locale="en" />;
}
