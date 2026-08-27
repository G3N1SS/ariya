import type { Metadata } from "next";
import CaseNovy from "@/components/CaseNovy";
import { dict } from "@/lib/dict";
import { caseOg } from "@/lib/og";

const title = "Case study: Novy Uroven — ARIYA";

export const metadata: Metadata = {
  title,
  description: dict.en.casePage.lead,
  alternates: {
    canonical: "/en/work/novy-uroven",
    languages: {
      ru: "/work/novy-uroven",
      en: "/en/work/novy-uroven",
    },
  },
  ...caseOg({
    title,
    description: dict.en.casePage.lead,
    path: "/en/work/novy-uroven",
    image: "/og/novy-uroven.png",
    locale: "en",
  }),
};

export default function Page() {
  return <CaseNovy locale="en" />;
}
