import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton-page";

export default function CustomersLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-canvas-soft border border-bdr rounded-md px-4 py-3 flex items-center gap-4">
              <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-2.5 w-32" />
              </div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
