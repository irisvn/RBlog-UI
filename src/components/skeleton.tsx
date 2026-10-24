/** Placeholder for a post list while it streams in. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="divide-y divide-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="py-6">
          <div className="h-3.5 w-40 rounded bg-surface" />
          <div className="mt-3 h-5 w-3/4 rounded bg-surface" />
          <div className="mt-3 h-3.5 w-full rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-3.5 w-48 rounded bg-surface" />
      <div className="mt-4 h-9 w-5/6 rounded bg-surface" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-4 rounded bg-surface" style={{ width: `${90 - (i % 3) * 12}%` }} />
        ))}
      </div>
    </div>
  );
}
