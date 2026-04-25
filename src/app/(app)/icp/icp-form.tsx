"use client";

import { useState } from "react";
import { saveICP } from "@/app/actions/icp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface ICPData {
  companyName: string;
  senderName: string;
  yourIndustry: string;
  whatYouSell: string;
  targetIndustries: string;
  companySize: string;
  minRevenue: string;
  targetRegion: string;
  problemYouSolve: string;
  decisionMakerTitle: string;
  decisionMakerDept: string;
}

export default function ICPForm({ initial }: { initial: ICPData }) {
  const [data, setData] = useState<ICPData>(initial);
  const [loading, setLoading] = useState(false);

  function set(field: keyof ICPData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await saveICP(data);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("ICP-profil lagret");
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="border-[#e8e4dc]">
        <CardHeader>
          <CardTitle className="text-base">Om ditt selskap</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Selskapsnavn</Label>
            <Input value={data.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Din Bedrift AS" />
          </div>
          <div className="space-y-1">
            <Label>Ditt navn (avsender i e-post)</Label>
            <Input value={data.senderName} onChange={(e) => set("senderName", e.target.value)} placeholder="Ola Nordmann" />
          </div>
          <div className="space-y-1">
            <Label>Din bransje</Label>
            <Input value={data.yourIndustry} onChange={(e) => set("yourIndustry", e.target.value)} placeholder="f.eks. SaaS / programvare" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Hva selger du?</Label>
            <Textarea value={data.whatYouSell} onChange={(e) => set("whatYouSell", e.target.value)} placeholder="Beskriv produktet eller tjenesten kort" rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e8e4dc]">
        <CardHeader>
          <CardTitle className="text-base">Ideell kundeprofil</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Målbransjer</Label>
            <Input value={data.targetIndustries} onChange={(e) => set("targetIndustries", e.target.value)} placeholder="f.eks. Bygg, Regnskap, IT" />
          </div>
          <div className="space-y-1">
            <Label>Selskapsstørrelse</Label>
            <Input value={data.companySize} onChange={(e) => set("companySize", e.target.value)} placeholder="f.eks. 10-100 ansatte" />
          </div>
          <div className="space-y-1">
            <Label>Minimum omsetning (MNOK)</Label>
            <Input value={data.minRevenue} onChange={(e) => set("minRevenue", e.target.value)} placeholder="f.eks. 5 MNOK" />
          </div>
          <div className="space-y-1">
            <Label>Geografisk fokus</Label>
            <Input value={data.targetRegion} onChange={(e) => set("targetRegion", e.target.value)} placeholder="f.eks. Oslo, Viken" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Problemet du løser</Label>
            <Textarea value={data.problemYouSolve} onChange={(e) => set("problemYouSolve", e.target.value)} placeholder="Hva er den primære smerten du adresserer?" rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e8e4dc]">
        <CardHeader>
          <CardTitle className="text-base">Beslutningstaker</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Tittel</Label>
            <Input value={data.decisionMakerTitle} onChange={(e) => set("decisionMakerTitle", e.target.value)} placeholder="f.eks. Daglig leder, CFO" />
          </div>
          <div className="space-y-1">
            <Label>Avdeling</Label>
            <Input value={data.decisionMakerDept} onChange={(e) => set("decisionMakerDept", e.target.value)} placeholder="f.eks. Finans, IT" />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="flex items-center gap-2">
        <Save size={15} />
        {loading ? "Lagrer…" : "Lagre ICP-profil"}
      </Button>
    </form>
  );
}
