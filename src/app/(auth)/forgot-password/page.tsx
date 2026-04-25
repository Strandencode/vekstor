"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Noe gikk galt");
    } else {
      setSent(true);
    }
  }

  return (
    <Card className="border-[#e8e4dc] bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Glemt passord</CardTitle>
        <CardDescription>Skriv inn e-posten din, så sender vi en tilbakestillingslenke</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-sm text-[#6b6b6b]">
              Sjekk innboksen din. Vi har sendt en tilbakestillingslenke til <strong>{email}</strong>.
            </p>
            <Button variant="ghost" className="mt-4 text-sm" onClick={() => setSent(false)}>
              Prøv igjen
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="du@eksempel.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sender…" : "Send tilbakestillingslenke"}
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm text-[#6b6b6b]">
          <Link href="/sign-in" className="text-[#1a1a1a] font-medium hover:underline">
            Tilbake til innlogging
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
