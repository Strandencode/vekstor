"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Passordet må være minst 8 tegn");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Noe gikk galt");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <Card className="border-[#e8e4dc] bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Opprett konto</CardTitle>
        <CardDescription>Kom i gang med Vekstor gratis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Fullt navn</Label>
            <Input
              id="name"
              placeholder="Ola Nordmann"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className="space-y-1">
            <Label htmlFor="password">Passord</Label>
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
            {loading ? "Oppretter konto…" : "Opprett konto"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-[#6b6b6b]">
          Har du allerede konto?{" "}
          <Link href="/sign-in" className="text-[#1a1a1a] font-medium hover:underline">
            Logg inn
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
