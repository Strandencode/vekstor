import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton-page";

export default function EmailLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Template list skeleton */}
          <div className="col-span-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-canvas-soft border border-bdr rounded-md p-3 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
          {/* Editor skeleton */}
          <div className="col-span-2 bg-canvas-soft border border-bdr rounded-md flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-bdr">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-48 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
