"use client";

import { useState } from "react";
import { searchBRREG, NACE_GROUPS, type BRREGCompany } from "@/lib/brreg";
import { addToPipeline } from "@/app/actions/pipeline";
import { saveList } from "@/app/actions/saved-lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Loader2, Bookmark, Kanban, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const EMPLOYEE_RANGES = [
  { label: "Alle størrelser", from: undefined, to: undefined },
  { label: "1–9 ansatte", from: 1, to: 9 },
  { label: "10–49 ansatte", from: 10, to: 49 },
  { label: "50–199 ansatte", from: 50, to: 199 },
  { label: "200+ ansatte", from: 200, to: undefined },
];

export default function SearchClient() {
  const [navn, setNavn] = useState("");
  const [naeringskode, setNaeringskode] = useState("all");
  const [kommunenummer, setKommunenummer] = useState("");
  const [employeeRange, setEmployeeRange] = useState("0");
  const [results, setResults] = useState<BRREGCompany[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saveOpen, setSaveOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [saving, setSaving] = useState(false);

  const range = EMPLOYEE_RANGES[parseInt(employeeRange)];

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSelected(new Set());
    try {
      const data = await searchBRREG({
        navn: navn || undefined,
        naeringskode: naeringskode !== "all" ? naeringskode : undefined,
        kommunenummer: kommunenummer || undefined,
        antallAnsatteFra: range.from,
        antallAnsatteTil: range.to,
        size: 50,
      });
      const companies = data._embedded?.enheter ?? [];
      setResults(companies);
      setTotalResults(data.page?.totalElements ?? 0);
    } catch {
      toast.error("Kunne ikke søke i Brønnøysundregistrene");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(orgNum: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orgNum)) next.delete(orgNum);
      else next.add(orgNum);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((r) => r.organisasjonsnummer)));
    }
  }

  async function handleAddToPipeline() {
    const companies = results.filter((r) => selected.has(r.organisasjonsnummer));
    let success = 0;
    for (const c of companies) {
      const res = await addToPipeline({
        orgNumber: c.organisasjonsnummer,
        name: c.navn,
        industry: c.naeringskode1?.beskrivelse,
        municipality: c.forretningsadresse?.kommune,
      });
      if (!res.error) success++;
    }
    toast.success(`${success} selskap(er) lagt til i pipeline`);
    setSelected(new Set());
  }

  async function handleSaveList() {
    if (!listName.trim()) return;
    setSaving(true);
    const companies = results.filter((r) => selected.has(r.organisasjonsnummer));
    const filterLabels = [
      naeringskode !== "all" ? NACE_GROUPS.find((g) => g.code === naeringskode)?.label : null,
      kommunenummer || null,
      range.label !== "Alle størrelser" ? range.label : null,
    ]
      .filter(Boolean)
      .join(", ");

    const res = await saveList({
      name: listName.trim(),
      filters: { navn, naeringskode, kommunenummer, employeeRange },
      filterLabels,
      companies: companies.map((c) => ({
        orgNumber: c.organisasjonsnummer,
        name: c.navn,
        industry: c.naeringskode1?.beskrivelse,
        municipality: c.forretningsadresse?.kommune,
        employees: c.antallAnsatte,
      })),
    });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Liste "${listName}" lagret`);
      setSaveOpen(false);
      setListName("");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">PROSPEKTERING</p>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Søk</h1>
        <p className="text-sm text-[#6b6b6b] mt-1">Søk i Brønnøysundregistrene</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-[#e8e4dc] rounded-lg p-5 mb-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="col-span-2 space-y-1">
            <Label>Selskapsnavn</Label>
            <Input value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="Søk på navn…" />
          </div>
          <div className="space-y-1">
            <Label>Bransje (NACE)</Label>
            <Select value={naeringskode} onValueChange={(v) => setNaeringskode(v ?? "all")}>
              <SelectTrigger><SelectValue placeholder="Alle bransjer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle bransjer</SelectItem>
                {NACE_GROUPS.map((g) => (
                  <SelectItem key={g.code} value={g.code}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Kommunenummer</Label>
            <Input value={kommunenummer} onChange={(e) => setKommunenummer(e.target.value)} placeholder="f.eks. 0301" />
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="w-48 space-y-1">
            <Label>Antall ansatte</Label>
            <Select value={employeeRange} onValueChange={(v) => setEmployeeRange(v ?? "0")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMPLOYEE_RANGES.map((r, i) => (
                  <SelectItem key={i} value={String(i)}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {loading ? "Søker…" : "Søk"}
          </Button>
        </div>
      </form>

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6b6b6b]">
                {totalResults.toLocaleString("nb-NO")} treff — viser {results.length}
              </span>
              {selected.size > 0 && (
                <Badge variant="secondary">{selected.size} valgt</Badge>
              )}
            </div>
            {selected.size > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSaveOpen(true)} className="flex items-center gap-1.5">
                  <Bookmark size={13} /> Lagre liste
                </Button>
                <Button size="sm" onClick={handleAddToPipeline} className="flex items-center gap-1.5">
                  <Kanban size={13} /> Legg til pipeline
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#e8e4dc] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e4dc] bg-[#faf9f6]">
                  <th className="px-4 py-2.5 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === results.length && results.length > 0}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[#6b6b6b] uppercase tracking-wide">Selskap</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[#6b6b6b] uppercase tracking-wide">Bransje</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[#6b6b6b] uppercase tracking-wide">Kommune</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[#6b6b6b] uppercase tracking-wide">Ansatte</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[#6b6b6b] uppercase tracking-wide">Orgnr</th>
                  <th className="px-4 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {results.map((company, i) => (
                  <tr
                    key={company.organisasjonsnummer}
                    className={`border-b border-[#e8e4dc] last:border-0 transition-colors ${
                      selected.has(company.organisasjonsnummer) ? "bg-[#f0ede6]" : i % 2 === 0 ? "bg-white" : "bg-[#faf9f6]"
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(company.organisasjonsnummer)}
                        onChange={() => toggleSelect(company.organisasjonsnummer)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[#1a1a1a]">{company.navn}</td>
                    <td className="px-4 py-2.5 text-[#4a4a4a] text-xs">{company.naeringskode1?.beskrivelse ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#4a4a4a] text-xs">{company.forretningsadresse?.kommune ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#4a4a4a] text-xs">{company.antallAnsatte ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#4a4a4a] font-mono text-xs">{company.organisasjonsnummer}</td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`https://data.brreg.no/enhetsregisteret/oppslag/enheter/${company.organisasjonsnummer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6b6b6b] hover:text-[#1a1a1a]"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lagre liste</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Listenavn</Label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="f.eks. IT-selskaper Oslo"
              autoFocus
            />
            <p className="text-xs text-[#6b6b6b]">{selected.size} selskap(er) lagres i listen</p>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveList} disabled={saving || !listName.trim()}>
              {saving ? "Lagrer…" : "Lagre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
