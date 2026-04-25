import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, StatCardsSkeleton } from "@/components/skeleton-page";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8">
        <StatCardsSkeleton count={4} />
        <div className="grid grid-cols-2 gap-6">
          {/* Funnel skeleton */}
          <div className="bg-canvas-soft border border-bdr rounded-md p-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-full rounded-md" style={{ opacity: 1 - i * 0.1 }} />
              </div>
            ))}
          </div>
          {/* Usage chart skeleton */}
          <div className="bg-canvas-soft border border-bdr rounded-md p-6 space-y-4">
            <Skeleton className="h-4 w-48" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-2.5 w-16 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-2.5 rounded-sm" style={{ width: `${60 - i * 8}%` }} />
                  <Skeleton className="h-2.5 rounded-sm" style={{ width: `${45 - i * 6}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
