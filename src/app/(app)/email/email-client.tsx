"use client";

import { useState, useTransition } from "react";
import { saveEmailTemplate, deleteEmailTemplate } from "@/app/actions/email-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy, Save, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const MERGE_TAGS = [
  "{{contact_name}}",
  "{{company_name}}",
  "{{industry}}",
  "{{city}}",
  "{{sender_name}}",
  "{{sender_company}}",
];

const PREVIEW_VALUES: Record<string, string> = {
  "{{contact_name}}": "Erik Nilsen",
  "{{company_name}}": "Cloudway Solutions AS",
  "{{industry}}": "IT & programvare",
  "{{city}}": "Oslo",
  "{{sender_name}}": "Jonas Dahl",
  "{{sender_company}}": "Vekstor AS",
};

function applyPreview(text: string) {
  return Object.entries(PREVIEW_VALUES).reduce((t, [k, v]) => t.replaceAll(k, v), text);
}

interface Template {
  id: string;
  name: string;
  subject: string | null;
  body: string | null;
  updatedAt: Date;
}

function TemplateEditor({
  template,
  onSave,
  onClose,
}: {
  template: Partial<Template>;
  onSave: (t: Template) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(template.name ?? "Ny mal");
  const [subject, setSubject] = useState(template.subject ?? "");
  const [body, setBody] = useState(template.body ?? "");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  function insertTag(tag: string) {
    setBody((b) => b + tag);
  }

  async function handleSave() {
    setSaving(true);
    const res = await saveEmailTemplate({ id: template.id, name, subject, body });
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Mal lagret");
      onSave({ id: res.id!, name, subject, body, updatedAt: new Date() });
    }
  }

  return (
    <div className="bg-white border border-[#e8e4dc] rounded-lg flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e4dc]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-semibold text-sm border-0 p-0 h-auto focus-visible:ring-0 bg-transparent max-w-64"
          placeholder="Malnavn…"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="p-1.5 rounded hover:bg-[#f0ede6] text-[#6b6b6b] transition-colors"
            title={preview ? "Rediger" : "Forhåndsvis"}
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <Button size="sm" variant="outline" onClick={onClose}>Avbryt</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5">
            <Save size={12} /> {saving ? "Lagrer…" : "Lagre"}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="space-y-1">
          <Label className="text-xs">Emne</Label>
          {preview ? (
            <p className="text-sm px-3 py-2 bg-[#faf9f6] border border-[#e8e4dc] rounded-md">
              {applyPreview(subject) || <span className="text-[#9b9b9b]">—</span>}
            </p>
          ) : (
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="f.eks. {{contact_name}} — en rask presentasjon"
            />
          )}
        </div>

        <div className="space-y-1 flex-1">
          <Label className="text-xs">Innhold</Label>
          {preview ? (
            <div className="text-sm px-3 py-2 bg-[#faf9f6] border border-[#e8e4dc] rounded-md whitespace-pre-wrap min-h-[200px]">
              {applyPreview(body) || <span className="text-[#9b9b9b]">—</span>}
            </div>
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hei {{contact_name}},&#10;&#10;…"
              className="w-full min-h-[200px] px-3 py-2 text-sm border border-[#e8e4dc] rounded-md outline-none focus:border-[#1a1a1a] resize-y bg-white font-mono"
            />
          )}
        </div>

        {!preview && (
          <div className="space-y-1">
            <Label className="text-xs text-[#6b6b6b]">Flettekoder</Label>
            <div className="flex flex-wrap gap-1.5">
              {MERGE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => insertTag(tag)}
                  className="text-xs px-2 py-0.5 bg-[#f0ede6] text-[#4a4a4a] rounded hover:bg-[#e8e4dc] transition-colors font-mono"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmailClient({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [, startTransition] = useTransition();

  function handleNew() {
    setEditingTemplate({ name: "Ny mal", subject: "", body: "" });
  }

  function handleEdit(t: Template) {
    setEditingTemplate(t);
  }

  function handleSaved(t: Template) {
    setTemplates((prev) => {
      const exists = prev.find((p) => p.id === t.id);
      return exists ? prev.map((p) => (p.id === t.id ? t : p)) : [t, ...prev];
    });
    setEditingTemplate(null);
  }

  function handleDuplicate(t: Template) {
    setEditingTemplate({ name: `${t.name} (kopi)`, subject: t.subject ?? "", body: t.body ?? "" });
  }

  function handleDelete(id: string) {
    const t = templates.find((x) => x.id === id)!;
    setTemplates((prev) => prev.filter((x) => x.id !== id));
    startTransition(async () => {
      const res = await deleteEmailTemplate(id);
      if (res.error) {
        toast.error("Feil ved sletting");
        setTemplates((prev) => [t, ...prev]);
      } else {
        toast.success("Mal slettet");
      }
    });
  }

  return (
    <div className="p-8 h-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">UTSENDELSE</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">E-postmaler</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Lag og administrer e-postmaler for kald canvas</p>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus size={14} /> Ny mal
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        <div className="col-span-1 space-y-2 overflow-y-auto pr-1">
          {templates.length === 0 && !editingTemplate && (
            <div className="text-center py-12 text-[#9b9b9b]">
              <Mail size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Ingen maler enda. Opprett din første.</p>
            </div>
          )}
          {templates.map((t) => (
            <div
              key={t.id}
              className={`group border rounded-lg p-3 cursor-pointer transition-colors ${
                editingTemplate && "id" in editingTemplate && editingTemplate.id === t.id
                  ? "border-[#1a1a1a] bg-[#f0ede6]"
                  : "border-[#e8e4dc] bg-white hover:bg-[#faf9f6]"
              }`}
              onClick={() => handleEdit(t)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{t.name}</p>
                  {t.subject && (
                    <p className="text-xs text-[#6b6b6b] truncate mt-0.5">{t.subject}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(t); }}
                    className="p-1 rounded hover:bg-[#e8e4dc] text-[#6b6b6b] transition-colors"
                    title="Dupliser"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    className="p-1 rounded hover:bg-red-50 text-[#6b6b6b] hover:text-red-400 transition-colors"
                    title="Slett"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] mt-1.5 py-0 px-1.5">
                {new Date(t.updatedAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
              </Badge>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {editingTemplate ? (
            <TemplateEditor
              template={editingTemplate}
              onSave={handleSaved}
              onClose={() => setEditingTemplate(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[#9b9b9b] border border-dashed border-[#e8e4dc] rounded-lg">
              <div className="text-center">
                <Mail size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Velg en mal for å redigere</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
