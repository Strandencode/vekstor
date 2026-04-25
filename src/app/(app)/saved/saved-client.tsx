"use client";

import { useState, useTransition } from "react";
import { deleteList } from "@/app/actions/saved-lists";
import { addToPipeline } from "@/app/actions/pipeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, ChevronDown, ChevronRight, Kanban, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface SavedCompany {
  orgNumber: string;
  name: string;
  industry?: string;
  municipality?: string;
  employees?: number;
}

interface SavedList {
  id: string;
  name: string;
  filterLabels: string | null;
  companies: unknown;
  totalResults: number | null;
  createdAt: Date;
}

function parseCompanies(raw: unknown): SavedCompany[] {
  if (!Array.isArray(raw)) return [];
  return raw as SavedCompany[];
}

export default function SavedClient({ initialLists }: { initialLists: SavedList[] }) {
  const [lists, setLists] = useState(initialLists);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    const list = lists.find((l) => l.id === id)!;
    setLists((prev) => prev.filter((l) => l.id !== id));
    startTransition(async () => {
      const res = await deleteList(id);
      if (res.error) {
        toast.error("Feil ved sletting");
        setLists((prev) => [list, ...prev]);
      } else {
        toast.success(`"${list.name}" slettet`);
      }
    });
  }

  async function handleAddAllToPipeline(list: SavedList) {
    setAddingId(list.id);
    const companies = parseCompanies(list.companies);
    let success = 0;
    for (const c of companies) {
      const res = await addToPipeline({
        orgNumber: c.orgNumber,
        name: c.name,
        industry: c.industry,
        municipality: c.municipality,
      });
      if (!res.error) success++;
    }
    setAddingId(null);
    toast.success(`${success} selskap(er) lagt til i pipeline`);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">PROSPEKTERING</p>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Lagrede lister</h1>
        <p className="text-sm text-[#6b6b6b] mt-1">
          {lists.length > 0 ? `${lists.length} lister lagret` : "Lagre søk fra Søk-siden for å se dem her"}
        </p>
      </div>

      {lists.length === 0 && (
        <div className="text-center py-20 text-[#9b9b9b]">
          <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-4">Ingen lagrede lister enda.</p>
          <Link href="/search">
            <Button variant="outline" className="flex items-center gap-2">
              <Search size={14} /> Gå til søk
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {lists.map((list) => {
          const companies = parseCompanies(list.companies);
          const isExpanded = expandedId === list.id;

          return (
            <div key={list.id} className="bg-white border border-[#e8e4dc] rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#faf9f6] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : list.id)}
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-[#6b6b6b] flex-shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-[#6b6b6b] flex-shrink-0" />
                )}
                <Bookmark size={14} className="text-[#6b6b6b] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[#1a1a1a]">{list.name}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {companies.length} selskaper
                    </Badge>
                  </div>
                  {list.filterLabels && (
                    <p className="text-xs text-[#9b9b9b] mt-0.5">{list.filterLabels}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#9b9b9b]">
                    {new Date(list.createdAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleAddAllToPipeline(list); }}
                    disabled={addingId === list.id}
                    className="flex items-center gap-1.5 h-7 text-xs"
                  >
                    <Kanban size={11} /> {addingId === list.id ? "Legger til…" : "Pipeline"}
                  </Button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }}
                    className="p-1.5 rounded hover:bg-red-50 text-[#c4bfb6] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-[#f0ede6]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#faf9f6] border-b border-[#e8e4dc]">
                        <th className="px-4 py-2 text-left font-medium text-[#6b6b6b] uppercase tracking-wide">Selskap</th>
                        <th className="px-4 py-2 text-left font-medium text-[#6b6b6b] uppercase tracking-wide">Bransje</th>
                        <th className="px-4 py-2 text-left font-medium text-[#6b6b6b] uppercase tracking-wide">Kommune</th>
                        <th className="px-4 py-2 text-left font-medium text-[#6b6b6b] uppercase tracking-wide">Ansatte</th>
                        <th className="px-4 py-2 text-left font-medium text-[#6b6b6b] uppercase tracking-wide">Orgnr</th>
                        <th className="px-4 py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c, i) => (
                        <tr
                          key={c.orgNumber}
                          className={`border-b border-[#f0ede6] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#faf9f6]/50"}`}
                        >
                          <td className="px-4 py-2 font-medium text-[#1a1a1a]">{c.name}</td>
                          <td className="px-4 py-2 text-[#6b6b6b]">{c.industry ?? "—"}</td>
                          <td className="px-4 py-2 text-[#6b6b6b]">{c.municipality ?? "—"}</td>
                          <td className="px-4 py-2 text-[#6b6b6b]">{c.employees ?? "—"}</td>
                          <td className="px-4 py-2 font-mono text-[#6b6b6b]">{c.orgNumber}</td>
                          <td className="px-4 py-2">
                            <a
                              href={`https://data.brreg.no/enhetsregisteret/oppslag/enheter/${c.orgNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#c4bfb6] hover:text-[#1a1a1a]"
                            >
                              <ExternalLink size={11} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
