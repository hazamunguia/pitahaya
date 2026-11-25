export default function Loading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando">
      <div className="h-12 w-48 animate-pulse rounded-md bg-sunken" />
      <div className="h-24 animate-pulse rounded-lg bg-sunken" />
      <div className="h-24 animate-pulse rounded-lg bg-sunken" />
      <div className="h-24 animate-pulse rounded-lg bg-sunken" />
    </div>
  );
}
