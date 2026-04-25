"use server";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { nanoid } from "@/lib/nanoid";
import { revalidatePath } from "next/cache";

export async function addCustomer(data: {
  name: string;
  orgNumber?: string;
  contactName?: string;
  contactRole?: string;
  email?: string;
  phone?: string;
  industry?: string;
  municipality?: string;
  revenue?: number;
  notes?: string;
}) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db.insert(customers).values({
    id: nanoid(),
    workspaceId: ctx.workspace.id,
    ...data,
    status: "won",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function updateCustomerNotes(customerId: string, notes: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db
    .update(customers)
    .set({ notes, updatedAt: new Date() })
    .where(and(eq(customers.id, customerId), eq(customers.workspaceId, ctx.workspace.id)));

  revalidatePath("/customers");
  return { success: true };
}

export async function addCustomerNote(customerId: string, text: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  const customer = await db.query.customers.findFirst({
    where: and(eq(customers.id, customerId), eq(customers.workspaceId, ctx.workspace.id)),
  });
  if (!customer) return { error: "Ikke funnet" };

  const log = Array.isArray(customer.notesLog)
    ? (customer.notesLog as { text: string; ts: string }[])
    : [];
  log.push({ text, ts: new Date().toISOString() });

  await db
    .update(customers)
    .set({ notesLog: log, updatedAt: new Date() })
    .where(eq(customers.id, customerId));

  revalidatePath("/customers");
  return { success: true };
}

export async function removeCustomer(customerId: string) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { error: "Ikke innlogget" };

  await db
    .delete(customers)
    .where(and(eq(customers.id, customerId), eq(customers.workspaceId, ctx.workspace.id)));

  revalidatePath("/customers");
  return { success: true };
}
