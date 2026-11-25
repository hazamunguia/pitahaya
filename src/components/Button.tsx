import Link from "next/link";
import Icon from "./Icon";

type Kind = "primary" | "secondary" | "light" | "ghost" | "accent";
type Size = "md" | "lg";

const kinds: Record<Kind, string> = {
  primary: "bg-forest text-lime border-forest shadow-sticker-sm",
  secondary: "bg-lime text-forest border-forest shadow-sticker-sm",
  light: "bg-cream text-forest border-forest shadow-sticker-sm",
  accent: "bg-magenta-deep text-white border-forest shadow-sticker-sm",
  ghost: "bg-transparent text-forest border-transparent",
};
const sizes: Record<Size, string> = { md: "min-h-12 px-6 text-base", lg: "min-h-14 px-8 text-lg" };

export default function Button({ href, children, kind = "primary", size = "md", arrow = false, className = "" }: {
  href: string; children: React.ReactNode; kind?: Kind; size?: Size; arrow?: boolean; className?: string;
}) {
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] font-bold transition-transform hover:-translate-y-0.5 ${kinds[kind]} ${sizes[size]} ${className}`}>
      {children}
      {arrow && <Icon name="arrow-right" size={size === "lg" ? 22 : 20} stroke={2.4} />}
    </Link>
  );
}
