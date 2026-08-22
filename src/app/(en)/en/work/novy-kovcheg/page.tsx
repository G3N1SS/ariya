import type { Metadata } from "next";
import CaseKovcheg from "@/components/CaseKovcheg";
import { dict } from "@/lib/dict";

export const metadata: Metadata = {
  title: "Case: Novy Kovcheg — ARIYA",
  description: dict.en.casePageNk.lead,
  alternates: {
    canonical: "/en/work/novy-kovcheg",
    languages: {
      ru: "/work/novy-kovcheg",
      en: "/en/work/novy-kovcheg",
    },
  },
};

export default function Page() {
  return <CaseKovcheg locale="en" />;
}
