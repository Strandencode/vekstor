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

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Passordet må være minst 8 tegn");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({ token, newPassword: password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Noe gikk galt. Lenken kan ha utløpt.");
    } else {
      toast.success("Passordet er oppdatert");
      router.push("/sign-in");
    }
  }

  if (!token) {
    return (
      <Card className="border-[#e8e4dc] bg-white shadow-sm">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-[#6b6b6b]">Ugyldig lenke. Be om en ny tilbakestillingslenke.</p>
          <Link href="/forgot-password">
            <Button variant="ghost" className="mt-4">Glemt passord</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#e8e4dc] bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Nytt passord</CardTitle>
        <CardDescription>Velg et nytt passord for kontoen din</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">Nytt passord</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minst 8 tegn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Oppdaterer…" : "Oppdater passord"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
