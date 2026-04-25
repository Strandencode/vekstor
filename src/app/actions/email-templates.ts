"use server";

import { db } from "@/db";
import { emailTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { getSession } from "@/lib/session";
import { nanoid } from "@/lib/nanoid";
import { revalidatePath } from "next/cache";

export async function saveEmailTemplate(data: {
  id?: string;
  name: string;
  subject: string;
  body: string;
}) {
  const ctx = await getCurrentWorkspace();
  const session = await getSession();
  if (!ctx || !session) return { error: "Ikke innlogget" };

  if (data.id) {
    await db
      .update(emailTemplates)
      .set({ name: data.name, subject: data.subject, body: data.body, updatedAt: new Date() })
      .where(and(eq(emailTemplates.id, data.id), eq(emailTemplates.workspaceId, ctx.workspace.id)));
    revalidatePath("/email");
    return { success: true, id: data.id };
  }

  const id = nanoid();
  await db.insert(emailTemplates).values({
    id,
    workspaceId: ctx.workspace.id,
    createdBy: session.user.id,
    name: data.name,
    subject: data.subject,
    body: data.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath("/email");
  return { success: true, id };
}

export async function deleteEmailTemplate(id: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db
    .delete(emailTemplates)
    .where(and(eq(emailTemplates.id, id), eq(emailTemplates.workspaceId, ctx.workspace.id)));

  revalidatePath("/email");
  return { success: true };
}
