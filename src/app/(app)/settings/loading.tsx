import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton-page";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8 max-w-3xl">
        {/* Tabs skeleton */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded" />
          ))}
        </div>
        {/* Form skeleton */}
        <div className="bg-canvas-soft border border-bdr rounded-md p-6 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-2.5 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
