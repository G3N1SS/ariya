import type { Metadata } from "next";
import PrismaLab from "@/components/three/PrismaLab";

export const metadata: Metadata = {
  title: "Призма — R&D",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PrismaLab />;
}
