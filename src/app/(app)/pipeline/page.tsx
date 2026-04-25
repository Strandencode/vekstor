export const dynamic = "force-dynamic";

import { db } from "@/db";
import { pipelineItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import PipelineClient from "./pipeline-client";
import { redirect } from "next/navigation";

export default async function PipelinePage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const items = await db
    .select()
    .from(pipelineItems)
    .where(eq(pipelineItems.workspaceId, ctx.workspace.id))
    .orderBy(pipelineItems.movedAt);

  return <PipelineClient initialItems={items} />;
}
