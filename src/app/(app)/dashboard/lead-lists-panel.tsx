import { db } from "@/db";
import { savedLists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export async function LeadListsPanel({ workspaceId }: { workspaceId: string }) {
  const lists = await db
    .select()
    .from(savedLists)
    .where(eq(savedLists.workspaceId, workspaceId))
    .orderBy(desc(savedLists.createdAt))
    .limit(6);

  return (
    <div className="bg-canvas-soft border border-bdr rounded-md overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h3
          className="text-[0.88rem] font-medium text-ink"
          style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}
        >
          Leadlister
        </h3>
        <Link
          href="/saved"
          className="text-[0.75rem] text-ink-subtle hover:text-ink transition-colors font-medium"
        >
          Se alle
        </Link>
      </div>
      <div className="px-5 pb-5">
        {lists.length === 0 ? (
          <p className="text-ink-subtle text-[0.82rem]">Ingen lister enda.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-bdr">
                {["Liste", "Leads", "Fremgang"].map((h) => (
                  <th
                    key={h}
                    className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-subtle font-semibold pb-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lists.map((l) => {
                const count = l.totalResults ?? 0;
                return (
                  <tr
                    key={l.id}
                    className="border-b border-bdr/50 last:border-0 hover:bg-canvas-warm/50 transition-colors"
                  >
                    <td className="py-2.5 text-[0.82rem] font-medium text-ink">{l.name}</td>
                    <td className="py-2.5 text-[0.82rem] font-mono text-ink-muted">{count}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-canvas-warm rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-ink"
                            style={{ width: count > 0 ? "100%" : "0%" }}
                          />
                        </div>
                        <span className="text-[0.7rem] text-ink-subtle font-mono w-8">
                          {count > 0 ? "100%" : "0%"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
