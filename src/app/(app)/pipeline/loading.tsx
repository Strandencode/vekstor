import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton-page";

function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col w-[280px] flex-shrink-0 bg-canvas-soft border border-bdr rounded-md">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bdr">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-4 w-6 rounded-full" />
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-canvas border border-bdr rounded-md p-3 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PipelineLoading() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeaderSkeleton />
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <KanbanColumnSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
