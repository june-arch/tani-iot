export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={["animate-pulse rounded-lg bg-muted", className].join(" ")} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-card border bg-background p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export function GridSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
