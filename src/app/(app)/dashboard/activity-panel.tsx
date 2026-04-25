import { db } from "@/db";
import { pipelineItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function ActivityPanel({ workspaceId }: { workspaceId: string }) {
  const recent = await db
    .select()
    .from(pipelineItems)
    .where(eq(pipelineItems.workspaceId, workspaceId))
    .orderBy(desc(pipelineItems.movedAt))
    .limit(8);

  return (
    <div className="bg-canvas-soft border border-bdr rounded-md overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h3
          className="text-[0.88rem] font-medium text-ink"
          style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}
        >
          Siste aktivitet
        </h3>
      </div>
      <div className="px-5 pb-5">
        {recent.length === 0 ? (
          <p className="text-ink-subtle text-[0.82rem]">Ingen aktivitet enda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((item) => (
              <div key={item.id} className="flex gap-2.5 text-[0.8rem]">
                <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 bg-sage" />
                <div className="flex-1 min-w-0">
                  <div className="text-ink-muted font-light">
                    Lagt til{" "}
                    <strong className="text-ink font-medium">
                      {item.name ?? item.orgNumber}
                    </strong>
                  </div>
                  <div className="text-[0.7rem] text-ink-subtle font-mono">{item.stageId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
