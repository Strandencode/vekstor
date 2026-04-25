"use server";

import { db } from "@/db";
import { icpProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "@/lib/nanoid";
import { getCurrentWorkspace } from "@/lib/get-workspace";

export async function saveICP(data: {
  companyName: string;
  senderName: string;
  yourIndustry: string;
  whatYouSell: string;
  targetIndustries: string;
  companySize: string;
  minRevenue: string;
  targetRegion: string;
  problemYouSolve: string;
  decisionMakerTitle: string;
  decisionMakerDept: string;
}) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  const existing = await db.query.icpProfiles.findFirst({
    where: eq(icpProfiles.workspaceId, ctx.workspace.id),
  });

  if (existing) {
    await db.update(icpProfiles).set({ ...data, updatedAt: new Date() }).where(eq(icpProfiles.id, existing.id));
  } else {
    await db.insert(icpProfiles).values({
      id: nanoid(),
      workspaceId: ctx.workspace.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath("/icp");
  return { success: true };
}
