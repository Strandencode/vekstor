"use client";

import { useState, useTransition } from "react";
import { addCustomerNote, removeCustomer } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trophy, Trash2, ChevronDown, ChevronRight, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { addCustomer } from "@/app/actions/customers";

interface Customer {
  id: string;
  name: string;
  orgNumber: string | null;
  contactName: string | null;
  contactRole: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  municipality: string | null;
  revenue: number | null;
  notes: string | null;
  status: string | null;
  wonDate: Date | null;
  notesLog: unknown;
}

function parseLog(raw: unknown): { text: string; ts: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw as { text: string; ts: string }[];
}

function formatNOK(n: number | null) {
  if (!n) return "—";
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteTexts, setNoteTexts] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    orgNumber: "",
    contactName: "",
    contactRole: "",
    email: "",
    phone: "",
    industry: "",
    municipality: "",
    revenue: "",
    notes: "",
  });

  const totalRevenue = customers.reduce((s, c) => s + (c.revenue ?? 0), 0);

  function handleAddNote(customerId: string) {
    const text = noteTexts[customerId]?.trim();
    if (!text) return;
    setNoteTexts((p) => ({ ...p, [customerId]: "" }));
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        const log = parseLog(c.notesLog);
        return { ...c, notesLog: [...log, { text, ts: new Date().toISOString() }] };
      })
    );
    startTransition(async () => {
      const res = await addCustomerNote(customerId, text);
      if (res.error) toast.error("Feil ved lagring av notat");
    });
  }

  function handleRemove(id: string) {
    const c = customers.find((x) => x.id === id)!;
    setCustomers((prev) => prev.filter((x) => x.id !== id));
    startTransition(async () => {
      const res = await removeCustomer(id);
      if (res.error) {
        toast.error("Feil ved sletting");
        setCustomers((prev) => [...prev, c]);
      } else {
        toast.success(`${c.name} fjernet`);
      }
    });
  }

  async function handleAdd() {
    if (!form.name.trim()) return;
    const res = await addCustomer({
      name: form.name.trim(),
      orgNumber: form.orgNumber || undefined,
      contactName: form.contactName || undefined,
      contactRole: form.contactRole || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      industry: form.industry || undefined,
      municipality: form.municipality || undefined,
      revenue: form.revenue ? parseInt(form.revenue) : undefined,
      notes: form.notes || undefined,
    });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`${form.name} lagt til`);
      setAddOpen(false);
      setForm({ name: "", orgNumber: "", contactName: "", contactRole: "", email: "", phone: "", industry: "", municipality: "", revenue: "", notes: "" });
      // Reload by forcing re-render via router is complex; user can refresh
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">KUNDER</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Vunne kunder</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">
            {customers.length} kunder · {formatNOK(totalRevenue)} total omsetning
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="flex items-center gap-2">
          <Plus size={14} /> Legg til kunde
        </Button>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-20 text-[#9b9b9b]">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Ingen kunder enda. Legg til dine første vunne kunder.</p>
        </div>
      )}

      <div className="space-y-2">
        {customers.map((customer) => {
          const isExpanded = expandedId === customer.id;
          const log = parseLog(customer.notesLog);
          return (
            <div key={customer.id} className="bg-white border border-[#e8e4dc] rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#faf9f6] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : customer.id)}
              >
                {isExpanded ? <ChevronDown size={14} className="text-[#6b6b6b] flex-shrink-0" /> : <ChevronRight size={14} className="text-[#6b6b6b] flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a1a1a] text-sm">{customer.name}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      <Trophy size={9} className="mr-1" /> Vunnet
                    </Badge>
                  </div>
                  {customer.contactName && (
                    <p className="text-xs text-[#6b6b6b]">{customer.contactName}{customer.contactRole ? `, ${customer.contactRole}` : ""}</p>
                  )}
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  {customer.industry && <span className="text-xs text-[#6b6b6b] hidden md:block">{customer.industry}</span>}
                  <span className="text-sm font-medium text-[#1a1a1a]">{formatNOK(customer.revenue)}</span>
                  <span className="text-xs text-[#9b9b9b]">{formatDate(customer.wonDate)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(customer.id); }}
                    className="p-1 rounded hover:bg-red-50 text-[#c4bfb6] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-[#f0ede6] px-4 py-4 bg-[#faf9f6]">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">Kontaktinfo</h4>
                      <dl className="space-y-1.5 text-sm">
                        {customer.email && <div className="flex gap-2"><dt className="text-[#9b9b9b] w-20">E-post</dt><dd><a href={`mailto:${customer.email}`} className="text-[#1a1a1a] hover:underline">{customer.email}</a></dd></div>}
                        {customer.phone && <div className="flex gap-2"><dt className="text-[#9b9b9b] w-20">Telefon</dt><dd>{customer.phone}</dd></div>}
                        {customer.municipality && <div className="flex gap-2"><dt className="text-[#9b9b9b] w-20">Kommune</dt><dd>{customer.municipality}</dd></div>}
                        {customer.orgNumber && <div className="flex gap-2"><dt className="text-[#9b9b9b] w-20">Orgnr</dt><dd className="font-mono">{customer.orgNumber}</dd></div>}
                      </dl>
                      {customer.notes && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b6b6b] mb-1">Notater</p>
                          <p className="text-sm text-[#4a4a4a] whitespace-pre-wrap">{customer.notes}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b6b6b] mb-3">Logg</h4>
                      <div className="flex gap-1.5 mb-3">
                        <Input
                          value={noteTexts[customer.id] ?? ""}
                          onChange={(e) => setNoteTexts((p) => ({ ...p, [customer.id]: e.target.value }))}
                          placeholder="Skriv logginnlegg…"
                          className="text-xs h-8"
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddNote(customer.id); }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddNote(customer.id)}
                          disabled={!noteTexts[customer.id]?.trim()}
                          className="h-8 px-2"
                        >
                          <Send size={12} />
                        </Button>
                      </div>
                      {log.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {[...log].reverse().map((entry, i) => (
                            <div key={i} className="bg-white border border-[#e8e4dc] rounded p-2.5">
                              <p className="text-xs text-[#4a4a4a]">{entry.text}</p>
                              <p className="text-[10px] text-[#9b9b9b] mt-1">
                                {new Date(entry.ts).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#9b9b9b]">Ingen logginnlegg enda.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legg til kunde</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Selskapsnavn *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Acme AS" autoFocus />
            </div>
            <div className="space-y-1">
              <Label>Kontaktperson</Label>
              <Input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} placeholder="Ola Nordmann" />
            </div>
            <div className="space-y-1">
              <Label>Stilling</Label>
              <Input value={form.contactRole} onChange={(e) => setForm((p) => ({ ...p, contactRole: e.target.value }))} placeholder="CEO" />
            </div>
            <div className="space-y-1">
              <Label>E-post</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="ola@acme.no" />
            </div>
            <div className="space-y-1">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="900 00 000" />
            </div>
            <div className="space-y-1">
              <Label>Bransje</Label>
              <Input value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} placeholder="IT / programvare" />
            </div>
            <div className="space-y-1">
              <Label>Orgnr</Label>
              <Input value={form.orgNumber} onChange={(e) => setForm((p) => ({ ...p, orgNumber: e.target.value }))} placeholder="123456789" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Omsetning (NOK)</Label>
              <Input value={form.revenue} onChange={(e) => setForm((p) => ({ ...p, revenue: e.target.value }))} placeholder="500000" type="number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Avbryt</Button>
            <Button onClick={handleAdd} disabled={!form.name.trim()}>Legg til</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
