import { db } from "@/db";
import { workspaceInvites, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import InviteAccept from "./invite-accept";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const invite = await db.query.workspaceInvites.findFirst({
    where: eq(workspaceInvites.token, token),
  });

  if (!invite) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold text-[#1a1a1a]">Ugyldig invitasjon</h2>
        <p className="text-sm text-[#6b6b6b] mt-2">Invitasjonen ble ikke funnet eller er utløpt.</p>
      </div>
    );
  }

  if (invite.acceptedAt) {
    redirect("/dashboard");
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold text-[#1a1a1a]">Invitasjonen er utløpt</h2>
        <p className="text-sm text-[#6b6b6b] mt-2">Be arbeidsområdeeieren om å sende en ny invitasjon.</p>
      </div>
    );
  }

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, invite.workspaceId),
  });

  return (
    <InviteAccept
      token={token}
      email={invite.email}
      workspaceName={workspace?.name ?? ""}
    />
  );
}
