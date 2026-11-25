import { ICON_PATHS } from "./icon-paths";

export type IconName = keyof typeof ICON_PATHS | (string & {});

export default function Icon({ name, size = 20, stroke = 2, className }: { name: IconName; size?: number; stroke?: number; className?: string }) {
  const body = ICON_PATHS[name] ?? "";
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
