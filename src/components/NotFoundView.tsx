"use client";

import dynamic from "next/dynamic";
import { dict, type Locale } from "@/lib/dict";

const PrismaScene = dynamic(() => import("./three/PrismaScene"), {
  ssr: false,
});

export default function NotFoundView({ locale }: { locale: Locale }) {
  const t = dict[locale].nf;
  const home = locale === "ru" ? "/" : "/en";
  return (
    <main className="nf">
      <div>
        <div className="nf-code">
          4<i>{"//"}</i>4
        </div>
        <h1>{t.title}</h1>
        <p>{t.text}</p>
        <a className="btn btn-primary" href={home}>
          {t.cta}
        </a>
        <div className="nf-note">{t.note}</div>
      </div>
      <div className="nf-visual">
        <PrismaScene mode="lost" />
      </div>
    </main>
  );
}
