import { db } from "@/db";
import { profiles, workspaces, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cache } from "react";
import { getSession } from "./session";

export const getCurrentWorkspace = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });
  if (!profile?.defaultWorkspaceId) return null;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, profile.defaultWorkspaceId),
  });
  if (!workspace) return null;

  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspace.id),
      eq(workspaceMembers.userId, session.user.id)
    ),
  });

  return { workspace, role: membership?.role ?? "member", userId: session.user.id };
});

export const getUserWorkspaces = cache(async () => {
  const session = await getSession();
  if (!session) return [];

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
    with: { workspace: true },
  });

  return memberships.map((m) => ({ workspace: m.workspace, role: m.role }));
});
