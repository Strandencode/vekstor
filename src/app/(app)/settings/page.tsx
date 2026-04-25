export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { db } from "@/db";
import { profiles, workspaceMembers, workspaceInvites, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "./profile-tab";
import WorkspaceTab from "./workspace-tab";
import MembersTab from "./members-tab";
import AccountTab from "./account-tab";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  const members = await db
    .select({
      id: workspaceMembers.id,
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
      name: user.name,
      email: user.email,
    })
    .from(workspaceMembers)
    .innerJoin(user, eq(workspaceMembers.userId, user.id))
    .where(eq(workspaceMembers.workspaceId, ctx.workspace.id));

  const invites = await db.query.workspaceInvites.findMany({
    where: (wi, { and, eq, isNull }) =>
      and(eq(wi.workspaceId, ctx.workspace.id), isNull(wi.acceptedAt)),
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Innstillinger</h1>
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="workspace">Arbeidsområde</TabsTrigger>
          <TabsTrigger value="members">Medlemmer</TabsTrigger>
          <TabsTrigger value="account">Konto</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            fullName={profile?.fullName ?? session.user.name}
            companyName={profile?.companyName ?? ""}
            phone={profile?.phone ?? ""}
          />
        </TabsContent>

        <TabsContent value="workspace">
          <WorkspaceTab
            workspaceId={ctx.workspace.id}
            workspaceName={ctx.workspace.name}
            plan={ctx.workspace.plan}
            role={ctx.role}
            memberCount={members.length}
          />
        </TabsContent>

        <TabsContent value="members">
          <MembersTab
            workspaceId={ctx.workspace.id}
            workspaceName={ctx.workspace.name}
            currentUserId={session.user.id}
            currentUserName={session.user.name}
            role={ctx.role}
            members={members}
            invites={invites.map((i) => ({
              id: i.id,
              email: i.email,
              role: i.role,
              expiresAt: i.expiresAt,
            }))}
          />
        </TabsContent>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
