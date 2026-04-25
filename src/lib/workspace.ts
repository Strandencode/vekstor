import { db } from "@/db";
import { workspaces, workspaceMembers, profiles } from "@/db/schema";
import { nanoid } from "./nanoid";

export async function createWorkspaceForUser(user: {
  id: string;
  name: string;
  email: string;
}) {
  const wsId = nanoid();
  const memberId = nanoid();

  const companyName = user.name + "s arbeidsområde";

  await db.insert(workspaces).values({
    id: wsId,
    name: companyName,
    ownerId: user.id,
    plan: "trialing",
    trialStartedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(workspaceMembers).values({
    id: memberId,
    workspaceId: wsId,
    userId: user.id,
    role: "owner",
    joinedAt: new Date(),
  });

  await db
    .insert(profiles)
    .values({
      userId: user.id,
      fullName: user.name,
      defaultWorkspaceId: wsId,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        defaultWorkspaceId: wsId,
      },
    });
}
