import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton-page";

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8">
        {/* Filter form skeleton */}
        <div className="bg-canvas-soft border border-bdr rounded-md p-5 mb-6">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="col-span-2 space-y-1.5">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div className="w-48 space-y-1.5">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        {/* Table skeleton */}
        <div className="bg-canvas-soft border border-bdr rounded-md overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-bdr">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-2.5" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-bdr/50 last:border-0">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
