import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton-page";

function FormCardSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-canvas-soft border border-bdr rounded-md p-5 space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className={`space-y-1.5 ${i === fields - 1 && fields % 2 !== 0 ? "col-span-2" : ""}`}>
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ICPLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <PageHeaderSkeleton />
      <div className="p-8 max-w-2xl space-y-6">
        <FormCardSkeleton fields={4} />
        <FormCardSkeleton fields={6} />
        <FormCardSkeleton fields={2} />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}
