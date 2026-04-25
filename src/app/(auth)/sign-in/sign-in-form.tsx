"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password, callbackURL: callbackUrl });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Feil e-post eller passord");
    } else {
      router.push(callbackUrl);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.magicLink({ email, callbackURL: callbackUrl });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Kunne ikke sende lenke");
    } else {
      setMagicSent(true);
    }
  }

  return (
    <Card className="border-[#e8e4dc] bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Logg inn</CardTitle>
        <CardDescription>Skriv inn e-post og passord for å fortsette</CardDescription>
      </CardHeader>
      <CardContent>
        {magicSent ? (
          <div className="text-center py-4">
            <p className="text-sm text-[#6b6b6b]">
              Sjekk innboksen din. Vi har sendt en påloggingslenke til <strong>{email}</strong>.
            </p>
            <Button variant="ghost" className="mt-4 text-sm" onClick={() => setMagicSent(false)}>
              Prøv igjen
            </Button>
          </div>
        ) : mode === "password" ? (
          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">E-post</Label>
              <Input id="email" type="email" placeholder="du@eksempel.no" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passord</Label>
                <Link href="/forgot-password" className="text-xs text-[#6b6b6b] hover:text-[#1a1a1a]">Glemt passord?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logger inn…" : "Logg inn"}</Button>
            <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setMode("magic")}>Logg inn med e-postlenke</Button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email-magic">E-post</Label>
              <Input id="email-magic" type="email" placeholder="du@eksempel.no" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sender lenke…" : "Send påloggingslenke"}</Button>
            <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setMode("password")}>Logg inn med passord</Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm text-[#6b6b6b]">
          Har du ikke konto?{" "}
          <Link href="/sign-up" className="text-[#1a1a1a] font-medium hover:underline">Opprett konto</Link>
        </div>
      </CardContent>
    </Card>
  );
}
