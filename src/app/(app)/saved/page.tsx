export const dynamic = "force-dynamic";

import { db } from "@/db";
import { savedLists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import SavedClient from "./saved-client";
import { redirect } from "next/navigation";

export default async function SavedPage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const lists = await db
    .select()
    .from(savedLists)
    .where(eq(savedLists.workspaceId, ctx.workspace.id))
    .orderBy(desc(savedLists.createdAt));

  return <SavedClient initialLists={lists} />;
}
