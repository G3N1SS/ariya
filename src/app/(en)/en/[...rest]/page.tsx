import { notFound } from "next/navigation";

// несуществующие пути под /en → английский 404
export default function CatchAll() {
  notFound();
}
