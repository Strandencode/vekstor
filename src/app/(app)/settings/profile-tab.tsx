"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Props {
  fullName: string;
  companyName: string;
  phone: string;
}

export default function ProfileTab({ fullName, companyName, phone }: Props) {
  const [name, setName] = useState(fullName);
  const [company, setCompany] = useState(companyName);
  const [tel, setTel] = useState(phone);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile({ fullName: name, companyName: company, phone: tel });
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Profil oppdatert");
    }
  }

  return (
    <Card className="border-[#e8e4dc]">
      <CardHeader>
        <CardTitle className="text-base">Profil</CardTitle>
        <CardDescription>Oppdater navn, selskap og telefonnummer</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4 max-w-sm">
          <div className="space-y-1">
            <Label htmlFor="fullName">Fullt navn</Label>
            <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="company">Selskap</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Lagrer…" : "Lagre"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
