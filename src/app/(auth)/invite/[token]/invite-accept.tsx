"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { acceptInvite } from "@/app/actions/invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Props {
  token: string;
  email: string;
  workspaceName: string;
}

export default function InviteAccept({ token, email, workspaceName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  async function doAccept() {
    const result = await acceptInvite(token);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Velkommen til ${workspaceName}!`);
      router.push("/dashboard");
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password: signInPassword,
      callbackURL: `/invite/${token}`,
    });
    if (error) {
      toast.error(error.message ?? "Feil passord");
      setLoading(false);
      return;
    }
    await doAccept();
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (signUpPassword.length < 8) {
      toast.error("Passordet må være minst 8 tegn");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: signUpName,
      email,
      password: signUpPassword,
      callbackURL: `/invite/${token}`,
    });
    if (error) {
      toast.error(error.message ?? "Noe gikk galt");
      setLoading(false);
      return;
    }
    await doAccept();
    setLoading(false);
  }

  return (
    <Card className="border-[#e8e4dc] bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Du er invitert til {workspaceName}</CardTitle>
        <CardDescription>
          Invitasjon sendt til <strong>{email}</strong>. Logg inn eller opprett konto for å akseptere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="signin" className="flex-1">Har konto</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Ny bruker</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1">
                <Label>E-post</Label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Passord</Label>
                <Input
                  id="password"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logger inn…" : "Logg inn og aksepter"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Fullt navn</Label>
                <Input
                  id="name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>E-post</Label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newpw">Passord</Label>
                <Input
                  id="newpw"
                  type="password"
                  placeholder="Minst 8 tegn"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Oppretter konto…" : "Opprett konto og aksepter"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
