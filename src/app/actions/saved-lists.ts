"use server";

import { db } from "@/db";
import { savedLists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { getSession } from "@/lib/session";
import { nanoid } from "@/lib/nanoid";
import { revalidatePath } from "next/cache";

export async function saveList(data: {
  name: string;
  filters: Record<string, unknown>;
  filterLabels: string;
  companies: unknown[];
}) {
  const ctx = await getCurrentWorkspace();
  const session = await getSession();
  if (!ctx || !session) return { error: "Ikke innlogget" };

  await db.insert(savedLists).values({
    id: nanoid(),
    workspaceId: ctx.workspace.id,
    createdBy: session.user.id,
    name: data.name,
    filters: data.filters,
    filterLabels: data.filterLabels,
    companies: data.companies,
    totalResults: data.companies.length,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/saved");
  return { success: true };
}

export async function deleteList(listId: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db
    .delete(savedLists)
    .where(and(eq(savedLists.id, listId), eq(savedLists.workspaceId, ctx.workspace.id)));

  revalidatePath("/saved");
  return { success: true };
}
