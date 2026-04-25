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
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">PROFIL</p>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">ICP-profil</h1>
        <p className="text-sm text-[#6b6b6b] mt-1">Definer din ideelle kundeprofil</p>
      </div>
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
  );
}
