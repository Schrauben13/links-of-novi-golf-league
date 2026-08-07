export default function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 py-6" aria-busy="true" aria-live="polite">
      <div className="h-7 w-40 animate-pulse rounded bg-fairway-100" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-fairway-100 bg-fairway-50"
          />
        ))}
      </div>
    </div>
  );
}
