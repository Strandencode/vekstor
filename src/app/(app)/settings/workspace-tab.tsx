"use client";

import { useState } from "react";
import { updateWorkspaceName } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const planLabels: Record<string, string> = {
  trialing: "Prøveperiode",
  professional: "Professional",
  business: "Business",
  enterprise: "Enterprise",
};

interface Props {
  workspaceId: string;
  workspaceName: string;
  plan: string;
  role: string;
  memberCount: number;
}

export default function WorkspaceTab({ workspaceId, workspaceName, plan, role, memberCount }: Props) {
  const [name, setName] = useState(workspaceName);
  const [loading, setLoading] = useState(false);
  const canEdit = ["owner", "admin"].includes(role);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateWorkspaceName(workspaceId, name);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Arbeidsområde oppdatert");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#e8e4dc]">
        <CardHeader>
          <CardTitle className="text-base">Arbeidsområde</CardTitle>
          <CardDescription>Navn og nåværende plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6b6b6b]">Plan</span>
            <Badge variant="secondary">{planLabels[plan] ?? plan}</Badge>
            <span className="text-sm text-[#6b6b6b]">{memberCount} {memberCount === 1 ? "medlem" : "medlemmer"}</span>
          </div>
          {canEdit ? (
            <form onSubmit={handleSave} className="space-y-4 max-w-sm">
              <div className="space-y-1">
                <Label htmlFor="wsName">Navn</Label>
                <Input id="wsName" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading}>{loading ? "Lagrer…" : "Lagre"}</Button>
            </form>
          ) : (
            <p className="text-sm text-[#4a4a4a]">{workspaceName}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
