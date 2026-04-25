"use server";

import { db } from "@/db";
import { profiles, workspaces, workspaceMembers, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  fullName: string;
  companyName: string;
  phone: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ikke innlogget" };

  await db
    .update(profiles)
    .set({ fullName: data.fullName, companyName: data.companyName, phone: data.phone })
    .where(eq(profiles.userId, session.user.id));

  await db
    .update(user)
    .set({ name: data.fullName, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/settings");
  return { success: true };
}

export async function updateWorkspaceName(workspaceId: string, name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ikke innlogget" };

  const member = await db.query.workspaceMembers.findFirst({
    where: (wm) => and(eq(wm.workspaceId, workspaceId), eq(wm.userId, session.user.id)),
  });
  if (!member || !["owner", "admin"].includes(member.role)) {
    return { error: "Ingen tilgang" };
  }

  await db
    .update(workspaces)
    .set({ name, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId));

  revalidatePath("/settings");
  return { success: true };
}

export async function removeMember(workspaceId: string, userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ikke innlogget" };

  const myMembership = await db.query.workspaceMembers.findFirst({
    where: (wm) => and(eq(wm.workspaceId, workspaceId), eq(wm.userId, session.user.id)),
  });
  if (!myMembership || myMembership.role !== "owner") {
    return { error: "Bare eier kan fjerne medlemmer" };
  }
  if (userId === session.user.id) return { error: "Kan ikke fjerne deg selv" };

  await db
    .delete(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));

  revalidatePath("/settings");
  return { success: true };
}

export async function changeMemberRole(
  workspaceId: string,
  userId: string,
  role: "admin" | "member"
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ikke innlogget" };

  const myMembership = await db.query.workspaceMembers.findFirst({
    where: (wm) => and(eq(wm.workspaceId, workspaceId), eq(wm.userId, session.user.id)),
  });
  if (!myMembership || myMembership.role !== "owner") {
    return { error: "Bare eier kan endre roller" };
  }

  await db
    .update(workspaceMembers)
    .set({ role })
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));

  revalidatePath("/settings");
  return { success: true };
}

