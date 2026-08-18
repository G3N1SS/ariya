import { notFound } from "next/navigation";

// любой несуществующий путь → честный 404 со страницей Призмы
export default function CatchAll() {
  notFound();
}
