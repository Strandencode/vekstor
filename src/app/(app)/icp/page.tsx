export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { db } from "@/db";
import { icpProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import ICPForm from "./icp-form";

export default async function ICPPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const icp = await db.query.icpProfiles.findFirst({
    where: eq(icpProfiles.workspaceId, ctx.workspace.id),
  });

  return (
    <div className="min-h-screen bg-canvas">
      <div className="px-8 py-5 bg-canvas border-b border-bdr sticky top-0 z-40">
        <div className="text-[0.6rem] uppercase tracking-[0.15em] text-ink-subtle font-semibold mb-1">INNSIKT</div>
        <h1 className="text-[1.7rem] font-semibold tracking-tight text-ink leading-none" style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}>ICP-analyse</h1>
        <p className="text-ink-muted text-[0.82rem] mt-1.5">Definer din ideelle kundeprofil for å målrette prospekteringen</p>
      </div>
      <div className="p-8 max-w-2xl">
        <ICPForm
          initial={{
            companyName: icp?.companyName ?? "",
            senderName: icp?.senderName ?? session.user.name,
            yourIndustry: icp?.yourIndustry ?? "",
            whatYouSell: icp?.whatYouSell ?? "",
            targetIndustries: icp?.targetIndustries ?? "",
            companySize: icp?.companySize ?? "",
            minRevenue: icp?.minRevenue ?? "",
            targetRegion: icp?.targetRegion ?? "",
            problemYouSolve: icp?.problemYouSolve ?? "",
            decisionMakerTitle: icp?.decisionMakerTitle ?? "",
            decisionMakerDept: icp?.decisionMakerDept ?? "",
          }}
        />
      </div>
    </div>
  );
}
