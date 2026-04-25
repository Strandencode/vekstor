export const dynamic = "force-dynamic";

import { db } from "@/db";
import { pipelineItems, savedLists, customers, usageCounters } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { redirect } from "next/navigation";
import { BarChart3, Trophy, Users, TrendingUp, Bookmark } from "lucide-react";

const STAGES = [
  { id: "new", label: "Ny", color: "#6b7280" },
  { id: "contacted", label: "Kontaktet", color: "#3b82f6" },
  { id: "meeting", label: "Møte", color: "#8b5cf6" },
  { id: "contract", label: "Tilbud", color: "#f59e0b" },
  { id: "won", label: "Vunnet", color: "#10b981" },
  { id: "lost", label: "Tapt", color: "#ef4444" },
];

function FunnelBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-[#1a1a1a]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1a1a1a]">{count.toLocaleString("nb-NO")}</span>
          <span className="text-xs text-[#9b9b9b]">({pct}%)</span>
        </div>
      </div>
      <div className="h-8 bg-[#f0ede6] rounded-lg overflow-hidden">
        <div
          className="h-full rounded-lg transition-all"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-white border border-[#e8e4dc] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#6b6b6b] uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{value}</p>
          {sub && <p className="text-xs text-[#9b9b9b] mt-0.5">{sub}</p>}
        </div>
        <div className="p-2.5 bg-[#f0ede6] rounded-lg">
          <Icon size={16} className="text-[#4a4a4a]" />
        </div>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const [pipeline, lists, wonCustomers, usage] = await Promise.all([
    db.select().from(pipelineItems).where(eq(pipelineItems.workspaceId, ctx.workspace.id)),
    db.select().from(savedLists).where(eq(savedLists.workspaceId, ctx.workspace.id)),
    db.select().from(customers).where(eq(customers.workspaceId, ctx.workspace.id)),
    db
      .select()
      .from(usageCounters)
      .where(eq(usageCounters.workspaceId, ctx.workspace.id))
      .orderBy(desc(usageCounters.monthKey))
      .limit(6),
  ]);

  const stageCounts: Record<string, number> = {};
  for (const stage of STAGES) {
    stageCounts[stage.id] = pipeline.filter((p) => p.stageId === stage.id).length;
  }
  const totalPipeline = pipeline.length;
  const totalLeadsInLists = lists.reduce((s, l) => s + (l.totalResults ?? 0), 0);
  const totalRevenue = wonCustomers.reduce((s, c) => s + (c.revenue ?? 0), 0);
  const wonCount = stageCounts["won"] ?? 0;
  const totalAttempted = totalPipeline;
  const winRate = totalAttempted > 0 ? Math.round((wonCount / totalAttempted) * 100) : 0;

  const recentUsage = usage.slice(0, 6).reverse();

  return (
    <div className="min-h-screen bg-canvas">
      <div className="px-8 py-5 bg-canvas border-b border-bdr sticky top-0 z-40">
        <div className="text-[0.6rem] uppercase tracking-[0.15em] text-ink-subtle font-semibold mb-1">INNSIKT</div>
        <h1 className="text-[1.7rem] font-semibold tracking-tight text-ink leading-none" style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}>Analytics</h1>
        <p className="text-ink-muted text-[0.82rem] mt-1.5">Oversikt over salgsaktivitet og pipeline-helse</p>
      </div>
    <div className="p-8">

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Pipeline" value={totalPipeline} icon={TrendingUp} sub="aktive leads" />
        <StatCard label="Lagrede leads" value={totalLeadsInLists.toLocaleString("nb-NO")} icon={Bookmark} sub={`${lists.length} lister`} />
        <StatCard label="Vunnet" value={wonCustomers.length} icon={Trophy} sub={totalRevenue > 0 ? new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(totalRevenue) : undefined} />
        <StatCard label="Vinnrate" value={`${winRate}%`} icon={BarChart3} sub="av pipeline" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-[#e8e4dc] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#1a1a1a] mb-5">Pipeline-trakt</h2>
          {totalPipeline === 0 ? (
            <p className="text-sm text-[#9b9b9b] text-center py-8">Ingen leads i pipeline enda.</p>
          ) : (
            <div className="space-y-3">
              {STAGES.map((stage) => (
                <FunnelBar
                  key={stage.id}
                  label={stage.label}
                  count={stageCounts[stage.id] ?? 0}
                  total={totalPipeline}
                  color={stage.color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e8e4dc] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#1a1a1a] mb-5">AI-bruk siste 6 måneder</h2>
          {recentUsage.length === 0 ? (
            <p className="text-sm text-[#9b9b9b] text-center py-8">Ingen bruksdata enda.</p>
          ) : (
            <div className="space-y-4">
              {recentUsage.map((u) => {
                const enrichments = u.enrichments ?? 0;
                const emails = u.emailsSent ?? 0;
                const maxVal = Math.max(...recentUsage.map((x) => Math.max(x.enrichments ?? 0, x.emailsSent ?? 0)), 1);
                return (
                  <div key={u.id} className="flex items-center gap-3">
                    <span className="text-xs text-[#6b6b6b] w-16 flex-shrink-0">{u.monthKey}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 bg-[#3b82f6] rounded-sm" style={{ width: `${Math.max((enrichments / maxVal) * 100, 2)}%` }} />
                        <span className="text-xs text-[#9b9b9b]">{enrichments} enrichments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 bg-[#8b5cf6] rounded-sm" style={{ width: `${Math.max((emails / maxVal) * 100, 2)}%` }} />
                        <span className="text-xs text-[#9b9b9b]">{emails} e-poster</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-2 border-t border-[#f0ede6]">
                <div className="flex items-center gap-1.5"><div className="w-3 h-2.5 bg-[#3b82f6] rounded-sm" /><span className="text-xs text-[#6b6b6b]">Enrichments</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-2.5 bg-[#8b5cf6] rounded-sm" /><span className="text-xs text-[#6b6b6b]">E-poster</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
