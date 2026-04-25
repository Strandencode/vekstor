"use client";

import { useState } from "react";
import { createInvite, revokeInvite } from "@/app/actions/invite";
import { removeMember, changeMemberRole } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const roleLabels: Record<string, string> = { owner: "Eier", admin: "Admin", member: "Medlem" };

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date;
  name: string;
  email: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
}

interface Props {
  workspaceId: string;
  workspaceName: string;
  currentUserId: string;
  currentUserName: string;
  role: string;
  members: Member[];
  invites: Invite[];
}

export default function MembersTab({
  workspaceId,
  workspaceName,
  currentUserId,
  currentUserName,
  role,
  members,
  invites,
}: Props) {
  const router = useRouter();
  const isOwner = role === "owner";
  const canManage = ["owner", "admin"].includes(role);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<Member | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    const result = await createInvite(workspaceId, inviteEmail, inviteRole, currentUserName, workspaceName);
    setInviteLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Invitasjon sendt til ${inviteEmail}`);
      setInviteEmail("");
      router.refresh();
    }
  }

  async function handleRevoke(inviteId: string) {
    await revokeInvite(inviteId);
    toast.success("Invitasjon trukket tilbake");
    router.refresh();
  }

  async function handleRemoveConfirm() {
    if (!pendingRemove) return;
    setRemovingUserId(pendingRemove.userId);
    const result = await removeMember(workspaceId, pendingRemove.userId);
    setRemovingUserId(null);
    setConfirmOpen(false);
    setPendingRemove(null);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Medlem fjernet");
      router.refresh();
    }
  }

  async function handleRoleChange(userId: string, newRole: "admin" | "member") {
    const result = await changeMemberRole(workspaceId, userId, newRole);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Rolle oppdatert");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <Card className="border-[#e8e4dc]">
          <CardHeader>
            <CardTitle className="text-base">Inviter til arbeidsområde</CardTitle>
            <CardDescription>Send invitasjon via e-post</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-2 items-end max-w-lg">
              <div className="flex-1 space-y-1">
                <Label htmlFor="inviteEmail">E-post</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="kollega@selskap.no"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="w-32 space-y-1">
                <Label>Rolle</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Medlem</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? "Sender…" : "Inviter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#e8e4dc]">
        <CardHeader>
          <CardTitle className="text-base">Medlemmer ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {members.map((m, i) => (
            <div key={m.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{m.name}</p>
                  <p className="text-xs text-[#6b6b6b]">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && m.userId !== currentUserId && m.role !== "owner" ? (
                    <Select
                      value={m.role}
                      onValueChange={(v) => handleRoleChange(m.userId, v as "admin" | "member")}
                    >
                      <SelectTrigger className="h-7 text-xs w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Medlem</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="text-xs">{roleLabels[m.role] ?? m.role}</Badge>
                  )}
                  {isOwner && m.userId !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 h-7 px-2 text-xs"
                      onClick={() => {
                        setPendingRemove(m);
                        setConfirmOpen(true);
                      }}
                    >
                      Fjern
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card className="border-[#e8e4dc]">
          <CardHeader>
            <CardTitle className="text-base">Ventende invitasjoner</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invites.map((inv, i) => (
              <div key={inv.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{inv.email}</p>
                    <p className="text-xs text-[#6b6b6b]">
                      {roleLabels[inv.role] ?? inv.role} · Utløper{" "}
                      {new Date(inv.expiresAt).toLocaleDateString("nb-NO")}
                    </p>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 h-7 px-2 text-xs"
                      onClick={() => handleRevoke(inv.id)}
                    >
                      Trekk tilbake
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fjern {pendingRemove?.name}?</DialogTitle>
            <DialogDescription>
              Dette vil fjerne {pendingRemove?.name} fra arbeidsområdet. De mister tilgang til alt innhold.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={!!removingUserId}
              onClick={handleRemoveConfirm}
            >
              {removingUserId ? "Fjerner…" : "Fjern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
