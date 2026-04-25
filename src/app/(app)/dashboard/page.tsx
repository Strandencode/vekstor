export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { db } from "@/db";
import { pipelineItems, usageCounters, savedLists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Search, Kanban, BarChart2, ArrowRight, Target, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STAGE_LABELS: Record<string, string> = {
  new: "Ny", contacted: "Kontaktet", meeting: "Møte",
  contract: "Kontrakt", won: "Vunnet", lost: "Tapt",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const wsId = ctx.workspace.id;
  const monthKey = new Date().toISOString().slice(0, 7);

  const [usage, pipeline, lists] = await Promise.all([
    db.query.usageCounters.findFirst({
      where: (uc, { and }) => and(eq(uc.workspaceId, wsId), eq(uc.monthKey, monthKey)),
    }),
    db.query.pipelineItems.findMany({
      where: eq(pipelineItems.workspaceId, wsId),
      orderBy: [desc(pipelineItems.movedAt)],
      limit: 50,
    }),
    db.query.savedLists.findMany({
      where: eq(savedLists.workspaceId, wsId),
      orderBy: [desc(savedLists.createdAt)],
      limit: 5,
    }),
  ]);

  const stageCounts = pipeline.reduce<Record<string, number>>((acc, p) => {
    acc[p.stageId] = (acc[p.stageId] ?? 0) + 1;
    return acc;
  }, {});

  const recentPipeline = pipeline.slice(0, 6);
  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">OVERSIKT</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Velkommen tilbake, {firstName}.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/search" className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#e8e4dc] text-sm font-medium text-[#4a4a4a] hover:bg-[#f0ede6] transition-colors">
            <Plus size={14} /> Finn leads
          </Link>
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Berikelser", value: usage?.enrichments ?? 0 },
          { label: "E-poster sendt", value: usage?.emailsSent ?? 0 },
          { label: "Telefoner vist", value: usage?.phonesViewed ?? 0 },
          { label: "I pipeline", value: pipeline.length },
        ].map((stat) => (
          <Card key={stat.label} className="border-[#e8e4dc]">
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-[#1a1a1a]">{stat.value.toLocaleString("nb-NO")}</p>
              <p className="text-xs text-[#6b6b6b] mt-1">denne måneden</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Søk", desc: "Søk i Brønnøysundregistrene", icon: Search, href: "/search" },
          { label: "Pipeline", desc: "Administrer salgsprosessen", icon: Kanban, href: "/pipeline" },
          { label: "Analyse", desc: "Metrikker og konvertering", icon: BarChart2, href: "/analytics" },
        ].map(({ label, desc, icon: Icon, href }) => (
          <Link key={href} href={href} className="group flex items-center gap-3 p-4 rounded-lg border border-[#e8e4dc] bg-white hover:border-[#1a1a1a]/30 hover:shadow-sm transition-all">
            <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#f0ede6]">
              <Icon size={16} className="text-[#1a1a1a]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1a1a1a]">{label}</p>
              <p className="text-xs text-[#6b6b6b]">{desc}</p>
            </div>
            <ArrowRight size={14} className="text-[#6b6b6b] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        {/* Pipeline stage summary */}
        <Card className="border-[#e8e4dc]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
              <Link href="/pipeline" className="text-xs text-[#6b6b6b] hover:text-[#1a1a1a]">Se alle</Link>
            </div>
          </CardHeader>
          <CardContent>
            {pipeline.length === 0 ? (
              <div className="text-center py-8">
                <Target size={32} className="mx-auto text-[#e8e4dc] mb-3" />
                <p className="text-sm text-[#6b6b6b]">Ingen leads i pipeline ennå.</p>
                <Link href="/search" className="text-xs font-medium text-[#1a1a1a] underline mt-2 block">Start prospektering</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {["new", "contacted", "meeting", "contract", "won", "lost"].map((stage) => {
                  const count = stageCounts[stage] ?? 0;
                  const pct = pipeline.length > 0 ? (count / pipeline.length) * 100 : 0;
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="text-xs text-[#6b6b6b] w-20 shrink-0">{STAGE_LABELS[stage]}</span>
                      <div className="flex-1 h-1.5 bg-[#f0ede6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1a1a1a] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-mono text-[#4a4a4a] w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent pipeline */}
        <Card className="border-[#e8e4dc]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Siste aktivitet</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPipeline.length === 0 ? (
              <p className="text-xs text-[#6b6b6b]">Ingen aktivitet ennå.</p>
            ) : (
              <div className="space-y-3">
                {recentPipeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] mt-[6px] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#1a1a1a] truncate">{item.name ?? item.orgNumber}</p>
                      <p className="text-xs text-[#6b6b6b]">{STAGE_LABELS[item.stageId]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
