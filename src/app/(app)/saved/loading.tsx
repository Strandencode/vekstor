import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton-page";

export default function SavedLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-canvas-soft border border-bdr rounded-md px-4 py-3 flex items-center gap-3">
            <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
            <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2.5 w-56" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
