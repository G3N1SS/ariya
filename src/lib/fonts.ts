import { Unbounded, Onest, JetBrains_Mono } from "next/font/google";

export const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const text = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-text",
});

export const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const fontVars = `${display.variable} ${text.variable} ${mono.variable}`;
