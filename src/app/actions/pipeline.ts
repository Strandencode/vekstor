"use server";

import { db } from "@/db";
import { pipelineItems, contactTracking } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { nanoid } from "@/lib/nanoid";
import { revalidatePath } from "next/cache";

export async function addToPipeline(company: {
  orgNumber: string;
  name: string;
  industry?: string;
  municipality?: string;
  contactName?: string;
  email?: string;
  phone?: string;
}) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db
    .insert(pipelineItems)
    .values({
      id: nanoid(),
      workspaceId: ctx.workspace.id,
      orgNumber: company.orgNumber,
      stageId: "new",
      movedAt: new Date(),
      name: company.name,
      industry: company.industry,
      municipality: company.municipality,
      contactName: company.contactName,
      email: company.email,
      phone: company.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  revalidatePath("/pipeline");
  return { success: true };
}

export async function updatePipelineStage(itemId: string, stageId: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db
    .update(pipelineItems)
    .set({ stageId: stageId as typeof pipelineItems.$inferInsert.stageId, movedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(pipelineItems.id, itemId), eq(pipelineItems.workspaceId, ctx.workspace.id)));

  revalidatePath("/pipeline");
  return { success: true };
}

export async function addPipelineNote(itemId: string, note: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  const item = await db.query.pipelineItems.findFirst({
    where: and(eq(pipelineItems.id, itemId), eq(pipelineItems.workspaceId, ctx.workspace.id)),
  });
  if (!item) return { error: "Ikke funnet" };

  const notes = Array.isArray(item.notes) ? (item.notes as { text: string; ts: string }[]) : [];
  notes.push({ text: note, ts: new Date().toISOString() });

  await db
    .update(pipelineItems)
    .set({ notes, updatedAt: new Date() })
    .where(eq(pipelineItems.id, itemId));

  revalidatePath("/pipeline");
  return { success: true };
}

export async function removePipelineItem(itemId: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db
    .delete(pipelineItems)
    .where(and(eq(pipelineItems.id, itemId), eq(pipelineItems.workspaceId, ctx.workspace.id)));

  revalidatePath("/pipeline");
  return { success: true };
}
