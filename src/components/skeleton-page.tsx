import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="px-8 py-5 bg-canvas border-b border-bdr sticky top-0 z-40">
      <Skeleton className="h-2.5 w-16 mb-2" />
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-3 w-64" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-${count} gap-4 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-canvas-soft border border-bdr rounded-md p-5">
          <Skeleton className="h-2 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-2 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-canvas-soft border border-bdr rounded-md overflow-hidden">
      <div className="flex gap-4 px-4 py-3 border-b border-bdr">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-bdr">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-3 flex-1" style={{ opacity: 1 - j * 0.15 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-${count} gap-3 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 p-4 rounded-md border border-bdr bg-canvas-soft">
          <Skeleton className="w-9 h-9 rounded flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
