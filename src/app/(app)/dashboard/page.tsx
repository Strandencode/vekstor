export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { db } from "@/db";
import { pipelineItems, usageCounters, savedLists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Search,
  Kanban,
  TrendingUp,
  ArrowRight,
  Target,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  Users,
  BarChart3,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const wsId = ctx.workspace.id;
  const monthKey = new Date().toISOString().slice(0, 7);

  const [usage, pipeline, lists] = await Promise.all([
    db.query.usageCounters.findFirst({
      where: (uc, { and }) =>
        and(eq(uc.workspaceId, wsId), eq(uc.monthKey, monthKey)),
    }),
    db.query.pipelineItems.findMany({
      where: eq(pipelineItems.workspaceId, wsId),
      orderBy: [desc(pipelineItems.movedAt)],
      limit: 50,
    }),
    db.query.savedLists.findMany({
      where: eq(savedLists.workspaceId, wsId),
      orderBy: [desc(savedLists.createdAt)],
      limit: 6,
    }),
  ]);

  const firstName = session.user.name.split(" ")[0];
  const totalLeads = lists.reduce((s, l) => s + (l.totalResults ?? 0), 0);
  const emailsSent = usage?.emailsSent ?? 0;
  const phonesViewed = usage?.phonesViewed ?? 0;
  const contactRate = totalLeads > 0
    ? Math.round(((emailsSent + phonesViewed) / totalLeads) * 100)
    : 0;

  const recentPipeline = pipeline.slice(0, 8);
  const isEmpty = pipeline.length === 0 && lists.length === 0;

  const statCards = [
    {
      label: "Totalt leads",
      value: totalLeads,
      icon: Users,
      hero: false,
      subtext: `${lists.length} lister`,
    },
    {
      label: "E-poster sendt",
      value: emailsSent,
      icon: Mail,
      hero: false,
      subtext: totalLeads > 0 ? `${Math.round((emailsSent / Math.max(totalLeads, 1)) * 100)}%` : "0%",
    },
    {
      label: "Samtaler",
      value: phonesViewed,
      icon: Phone,
      hero: false,
      subtext: totalLeads > 0 ? `${Math.round((phonesViewed / Math.max(totalLeads, 1)) * 100)}%` : "0%",
    },
    {
      label: "Kontaktrate",
      value: `${contactRate}%`,
      icon: BarChart3,
      hero: true,
      subtext: `${emailsSent + phonesViewed} av ${totalLeads}`,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="px-8 py-5 bg-canvas border-b border-bdr flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.15em] text-ink-subtle font-semibold mb-1">
            OVERSIKT
          </div>
          <h1
            className="text-[1.7rem] font-semibold tracking-tight text-ink leading-none"
            style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}
          >
            Dashboard
          </h1>
          <p className="text-ink-muted text-[0.82rem] mt-1.5">
            Velkommen tilbake, {firstName}.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/icp"
            className="flex items-center gap-2 px-4 py-2 rounded text-[0.82rem] font-medium border border-bdr text-ink-muted hover:bg-canvas-warm hover:text-ink transition-all"
          >
            <RefreshCw size={14} /> Bytt mal
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 px-4 py-2 rounded text-[0.82rem] font-medium border border-bdr text-ink-muted hover:bg-canvas-warm hover:text-ink transition-all"
          >
            <Search size={14} /> Nytt søk
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 px-4 py-2 rounded text-[0.82rem] font-medium text-canvas bg-ink hover:bg-ink-soft transition-all"
          >
            <Plus size={14} /> Finn Leads
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`rounded-md p-5 relative overflow-hidden border transition-all ${
                  s.hero
                    ? "bg-ink border-ink text-canvas"
                    : "bg-canvas-soft border-bdr text-ink"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div
                      className="text-[0.6rem] uppercase tracking-[0.1em] font-semibold mb-2"
                      style={{ color: s.hero ? "rgba(244,240,230,0.6)" : "#8A9389" }}
                    >
                      {s.label}
                    </div>
                    <div
                      className="text-[1.9rem] font-bold leading-none"
                      style={{
                        fontFamily: "var(--font-work-sans), system-ui, sans-serif",
                        color: s.hero ? "#B8E0C3" : "#07140E",
                      }}
                    >
                      {typeof s.value === "number"
                        ? s.value.toLocaleString("nb-NO")
                        : s.value}
                    </div>
                    <div
                      className="text-[0.72rem] mt-2"
                      style={{ color: s.hero ? "rgba(244,240,230,0.6)" : "#8A9389" }}
                    >
                      {s.subtext}
                    </div>
                  </div>
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: s.hero ? "rgba(184,224,195,0.15)" : "rgba(7,20,14,0.05)",
                    }}
                  >
                    <Icon
                      size={16}
                      style={{ color: s.hero ? "#B8E0C3" : "#07140E" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Prospektering", desc: "Søk i Brønnøysundregistrene", icon: Search, href: "/search" },
            { label: "Pipeline", desc: "Administrer salgsprosessen", icon: Kanban, href: "/pipeline" },
            { label: "Analytics", desc: "Oversikt og metrikker", icon: TrendingUp, href: "/analytics" },
          ].map(({ label, desc, icon: Icon, href }, i) => (
            <Link
              key={i}
              href={href}
              className="group flex items-center gap-3.5 p-4 rounded-md border border-bdr bg-canvas-soft hover:border-ink/30 hover:shadow-sm transition-all text-left"
            >
              <div className="w-9 h-9 rounded flex items-center justify-center bg-ink/5">
                <Icon size={16} className="text-ink" />
              </div>
              <div className="flex-1">
                <div className="text-[0.85rem] font-semibold text-ink">{label}</div>
                <div className="text-[0.72rem] text-ink-muted">{desc}</div>
              </div>
              <ArrowRight
                size={14}
                className="text-ink-subtle group-hover:translate-x-0.5 group-hover:text-ink transition-all"
              />
            </Link>
          ))}
        </div>

        {isEmpty ? (
          <div className="bg-canvas-soft border border-bdr rounded-md p-16 text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center bg-sage-soft">
              <Target size={22} className="text-ink" />
            </div>
            <h3
              className="text-[1.4rem] font-semibold mb-2 text-ink tracking-tight"
              style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}
            >
              Kom i gang med Vekstor
            </h3>
            <p className="text-ink-muted text-[0.88rem] mb-8 max-w-md mx-auto">
              Definer din ICP, søk etter leads og bygg din første liste. Alle metrikker oppdateres i sanntid.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/icp"
                className="px-5 py-2.5 border border-bdr rounded text-[0.82rem] font-medium text-ink-muted hover:text-ink hover:bg-canvas-warm transition-all"
              >
                Definer ICP
              </Link>
              <Link
                href="/search"
                className="px-5 py-2.5 rounded text-[0.82rem] font-medium text-canvas bg-ink hover:bg-ink-soft transition-all"
              >
                Start prospektering
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            {/* Leadlister */}
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
              </div>
            </div>

            {/* Siste aktivitet */}
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
                {recentPipeline.length === 0 ? (
                  <p className="text-ink-subtle text-[0.82rem]">Ingen aktivitet enda.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentPipeline.map((item) => (
                      <div key={item.id} className="flex gap-2.5 text-[0.8rem]">
                        <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 bg-sage" />
                        <div className="flex-1 min-w-0">
                          <div className="text-ink-muted font-light">
                            Lagt til{" "}
                            <strong className="text-ink font-medium">
                              {item.name ?? item.orgNumber}
                            </strong>
                          </div>
                          <div className="text-[0.7rem] text-ink-subtle font-mono">
                            {item.stageId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
