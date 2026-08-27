import type { Metadata } from "next";
import CaseKovcheg from "@/components/CaseKovcheg";
import { dict } from "@/lib/dict";
import { caseOg } from "@/lib/og";

const title = "Case: Novy Kovcheg — ARIYA";

export const metadata: Metadata = {
  title,
  description: dict.en.casePageNk.lead,
  alternates: {
    canonical: "/en/work/novy-kovcheg",
    languages: {
      ru: "/work/novy-kovcheg",
      en: "/en/work/novy-kovcheg",
    },
  },
  ...caseOg({
    title,
    description: dict.en.casePageNk.lead,
    path: "/en/work/novy-kovcheg",
    image: "/og/novy-kovcheg.png",
    locale: "en",
  }),
};

export default function Page() {
  return <CaseKovcheg locale="en" />;
}
