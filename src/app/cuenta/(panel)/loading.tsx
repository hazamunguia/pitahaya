export default function Loading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando">
      <div className="h-10 w-40 animate-pulse rounded-md bg-sunken" />
      <div className="h-28 animate-pulse rounded-lg bg-sunken" />
      <div className="h-28 animate-pulse rounded-lg bg-sunken" />
    </div>
  );
}
