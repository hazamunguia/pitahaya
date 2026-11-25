import AuthForm from "@/components/AuthForm";
import { safeNext } from "@/lib/next-url";

export const metadata = { title: "Mi cuenta · PITAHAYA Beauty Studio" };
export const instant = false;

export default async function AccesoPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm next={next ? safeNext(next, "") || undefined : undefined} />;
}
