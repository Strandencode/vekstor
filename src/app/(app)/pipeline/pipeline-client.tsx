"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updatePipelineStage, addPipelineNote, removePipelineItem } from "@/app/actions/pipeline";
import { GripVertical, StickyNote, Trash2, Send, X } from "lucide-react";
import { toast } from "sonner";

type StageId = "new" | "contacted" | "meeting" | "contract" | "won" | "lost";

interface PipelineItem {
  id: string;
  orgNumber: string;
  name: string | null;
  industry: string | null;
  municipality: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  stageId: StageId;
  notes: unknown;
  movedAt: Date | null;
}

const STAGES: { id: StageId; label: string; color: string }[] = [
  { id: "new", label: "Ny", color: "#6b7280" },
  { id: "contacted", label: "Kontaktet", color: "#3b82f6" },
  { id: "meeting", label: "Møte", color: "#8b5cf6" },
  { id: "contract", label: "Tilbud", color: "#f59e0b" },
  { id: "won", label: "Vunnet", color: "#10b981" },
  { id: "lost", label: "Tapt", color: "#ef4444" },
];

function parseNotes(raw: unknown): { text: string; ts: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw as { text: string; ts: string }[];
}

function PipelineCard({
  item,
  onRemove,
  onAddNote,
}: {
  item: PipelineItem;
  onRemove: (id: string) => void;
  onAddNote: (id: string, text: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const notes = parseNotes(item.notes);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function submitNote() {
    if (!noteText.trim()) return;
    onAddNote(item.id, noteText.trim());
    setNoteText("");
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-[#e8e4dc] rounded-lg p-3 group hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-[#c4bfb6] hover:text-[#6b6b6b] cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1a1a1a] truncate">{item.name ?? "—"}</p>
          <p className="text-xs text-[#6b6b6b] truncate">{item.industry ?? "Ukjent bransje"}</p>
          {item.municipality && (
            <p className="text-xs text-[#9b9b9b] mt-0.5">{item.municipality}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => { setExpanded(!expanded); setNoteText(""); }}
            className={`p-1 rounded hover:bg-[#f0ede6] transition-colors relative ${expanded ? "text-[#1a1a1a]" : "text-[#c4bfb6]"}`}
          >
            <StickyNote size={13} />
            {notes.length > 0 && !expanded && (
              <span className="absolute -top-1 -right-1 text-[9px] bg-[#1a1a1a] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                {notes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded hover:bg-red-50 text-[#c4bfb6] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-[#f0ede6]">
          <div className="flex gap-1.5 mb-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Legg til notat…"
              className="flex-1 px-2 py-1.5 text-xs border border-[#e8e4dc] rounded-md outline-none focus:border-[#1a1a1a] bg-[#faf9f6]"
              onKeyDown={(e) => { if (e.key === "Enter") submitNote(); }}
            />
            <button
              onClick={submitNote}
              disabled={!noteText.trim()}
              className="p-1.5 rounded-md bg-[#1a1a1a] text-white disabled:opacity-30 hover:bg-[#333] transition-colors"
            >
              <Send size={11} />
            </button>
          </div>
          {notes.length > 0 && (
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {[...notes].reverse().map((note, i) => (
                <div key={i} className="p-2 bg-[#faf9f6] rounded text-xs text-[#4a4a4a]">
                  <p>{note.text}</p>
                  <p className="text-[10px] text-[#9b9b9b] mt-0.5">
                    {new Date(note.ts).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StageColumn({
  stage,
  items,
  onRemove,
  onAddNote,
}: {
  stage: (typeof STAGES)[number];
  items: PipelineItem[];
  onRemove: (id: string) => void;
  onAddNote: (id: string, text: string) => void;
}) {
  return (
    <div className="flex flex-col w-[280px] flex-shrink-0 bg-[#faf9f6] border border-[#e8e4dc] rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e4dc]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1a1a1a]">{stage.label}</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${stage.color}1a`, color: stage.color }}
          >
            {items.length}
          </span>
        </div>
      </div>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px]">
          {items.length === 0 && (
            <p className="text-xs text-[#9b9b9b] text-center py-6">
              {stage.id === "new" ? "Legg til fra søk" : "Dra kort hit"}
            </p>
          )}
          {items.map((item) => (
            <PipelineCard key={item.id} item={item} onRemove={onRemove} onAddNote={onAddNote} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function PipelineClient({ initialItems }: { initialItems: PipelineItem[] }) {
  const [items, setItems] = useState<PipelineItem[]>(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeItem = items.find((i) => i.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedItem = items.find((i) => i.id === active.id);
    if (!draggedItem) return;

    // Determine target stage: over could be a column or another card
    let targetStageId: StageId | null = null;

    // Check if dropped over a stage column id
    const overAsStage = STAGES.find((s) => s.id === over.id);
    if (overAsStage) {
      targetStageId = overAsStage.id;
    } else {
      // Dropped over another card — use that card's stage
      const overItem = items.find((i) => i.id === over.id);
      if (overItem) targetStageId = overItem.stageId;
    }

    if (!targetStageId || targetStageId === draggedItem.stageId) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === draggedItem.id ? { ...i, stageId: targetStageId! } : i))
    );

    startTransition(async () => {
      const res = await updatePipelineStage(draggedItem.id, targetStageId!);
      if (res.error) {
        toast.error("Kunne ikke oppdatere stage");
        setItems((prev) =>
          prev.map((i) => (i.id === draggedItem.id ? { ...i, stageId: draggedItem.stageId } : i))
        );
      }
    });
  }

  function handleRemove(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      const res = await removePipelineItem(id);
      if (res.error) {
        toast.error("Feil ved sletting");
        setItems((prev) => [...prev, item]);
      } else {
        toast.success(`${item.name} fjernet`);
      }
    });
  }

  function handleAddNote(id: string, text: string) {
    startTransition(async () => {
      const res = await addPipelineNote(id, text);
      if (res.error) {
        toast.error("Feil ved lagring av notat");
      } else {
        // Re-fetch optimistically by updating local state
        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== id) return i;
            const existing = parseNotes(i.notes);
            return { ...i, notes: [...existing, { text, ts: new Date().toISOString() }] };
          })
        );
        toast.success("Notat lagret");
      }
    });
  }

  function parseNotes(raw: unknown): { text: string; ts: string }[] {
    if (!Array.isArray(raw)) return [];
    return raw as { text: string; ts: string }[];
  }

  const total = items.length;

  return (
    <div className="flex flex-col h-[calc(100vh-0px)]">
      <div className="px-8 py-6 border-b border-[#e8e4dc] bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-1">SALG</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Pipeline</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">
            {total > 0 ? `${total} leads i pipeline` : "Dra leads mellom kolonner for å oppdatere status"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                items={items.filter((i) => i.stageId === stage.id)}
                onRemove={handleRemove}
                onAddNote={handleAddNote}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem && (
              <div className="bg-white border border-[#e8e4dc] rounded-lg p-3 shadow-xl rotate-1 w-[256px]">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">{activeItem.name ?? "—"}</p>
                <p className="text-xs text-[#6b6b6b]">{activeItem.industry ?? "Ukjent bransje"}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
