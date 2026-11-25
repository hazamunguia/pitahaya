import { ESTADOS } from "@/lib/format";

const color: Record<string, string> = {
  pending: "bg-blush",
  confirmed: "bg-lime",
  done: "bg-cream",
  cancelled: "bg-danger-bg text-danger-text",
  quote: "bg-blush",
};

export default function StatusBadge({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full border-[1.5px] border-forest px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${color[estado] ?? "bg-cream"}`}>
      {ESTADOS[estado] ?? estado}
    </span>
  );
}
