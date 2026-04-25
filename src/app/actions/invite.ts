"use server";

import { db } from "@/db";
import { workspaceInvites, workspaceMembers, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "@/lib/nanoid";
import { headers } from "next/headers";
import { sendInviteEmail } from "@/lib/email";

export async function acceptInvite(token: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ikke innlogget" };

  const invite = await db.query.workspaceInvites.findFirst({
    where: eq(workspaceInvites.token, token),
  });
  if (!invite) return { error: "Invitasjon ikke funnet" };
  if (invite.acceptedAt) return { error: "Invitasjon allerede akseptert" };
  if (invite.expiresAt < new Date()) return { error: "Invitasjonen er utløpt" };

  const existing = await db.query.workspaceMembers.findFirst({
    where: (wm, { and }) =>
      and(
        eq(wm.workspaceId, invite.workspaceId),
        eq(wm.userId, session.user.id)
      ),
  });

  if (!existing) {
    await db.insert(workspaceMembers).values({
      id: nanoid(),
      workspaceId: invite.workspaceId,
      userId: session.user.id,
      role: invite.role,
      joinedAt: new Date(),
    });
  }

  await db
    .update(workspaceInvites)
    .set({ acceptedAt: new Date(), acceptedBy: session.user.id })
    .where(eq(workspaceInvites.token, token));

  await db
    .update(profiles)
    .set({ defaultWorkspaceId: invite.workspaceId })
    .where(eq(profiles.userId, session.user.id));

  return { success: true, workspaceId: invite.workspaceId };
}

export async function createInvite(
  workspaceId: string,
  email: string,
  role: "admin" | "member",
  inviterName: string,
  workspaceName: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ikke innlogget" };

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await db.insert(workspaceInvites).values({
    id: nanoid(),
    workspaceId,
    email,
    role,
    token,
    invitedBy: session.user.id,
    invitedAt: new Date(),
    expiresAt,
  });

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  await sendInviteEmail(email, inviterName, workspaceName, `${baseUrl}/invite/${token}`);

  return { success: true };
}

export async function revokeInvite(inviteId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ikke innlogget" };
  await db.delete(workspaceInvites).where(eq(workspaceInvites.id, inviteId));
  return { success: true };
}
