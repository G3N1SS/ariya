"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/dict";

// Пасхалка для тех, кто открывает девтулзы.
export default function ConsoleEgg({ locale }: { locale: Locale }) {
  useEffect(() => {
    const ru = locale === "ru";
    // eslint-disable-next-line no-console
    console.log(
      "%c///%c " +
        (ru
          ? "АРИЯ — студия цифровых продуктов"
          : "ARIYA — digital product studio") +
        "\n%c" +
        (ru
          ? "смотришь под капот? уважение.\nесть задача → телеграм в шапке"
          : "peeking under the hood? respect.\ngot a task → telegram in the header"),
      "color:#0C5EFF;font-weight:700;font-size:18px",
      "color:#0D1033;font-weight:600;font-size:13px",
      "color:#8a8fa8;font-size:12px"
    );
  }, [locale]);
  return null;
}
