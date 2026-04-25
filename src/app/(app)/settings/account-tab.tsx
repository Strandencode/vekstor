"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AccountTab() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/sign-in");
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await authClient.deleteUser();
    if (error) {
      toast.error(error.message ?? "Noe gikk galt");
      setDeleting(false);
    } else {
      router.push("/sign-in");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#e8e4dc]">
        <CardHeader>
          <CardTitle className="text-base">Økt</CardTitle>
          <CardDescription>Logg ut av alle enheter</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Logger ut…" : "Logg ut"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#e8e4dc] border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Slett konto</CardTitle>
          <CardDescription>
            Sletter kontoen og alle tilhørende data permanent. Kan ikke angres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button variant="destructive" onClick={() => setOpen(true)}>Slett konto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Er du sikker?</DialogTitle>
                <DialogDescription>
                  Kontoen og alle data slettes permanent. Dette kan ikke angres.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Sletter…" : "Slett konto permanent"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
