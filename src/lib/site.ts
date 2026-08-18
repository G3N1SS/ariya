// Домен сайта: до покупки домена живёт заглушка из env / localhost.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";
