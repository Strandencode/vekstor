import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, StatCardsSkeleton, CardRowSkeleton } from "@/components/skeleton-page";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8">
        <StatCardsSkeleton count={4} />
        <CardRowSkeleton count={3} />
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="bg-canvas-soft border border-bdr rounded-md p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="bg-canvas-soft border border-bdr rounded-md p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
