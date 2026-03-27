"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  FileText, Trash2, Pencil, Calendar, History, ListTodo, 
  MoreVertical, GripVertical 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ClientUpdate } from "@/types";
import { getClientUpdates, deleteClientUpdate, reorderClientUpdates } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CreateUpdateDialog } from "@/components/client-updates/CreateUpdateDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// DnD Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ClientUpdatesPage() {
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchUpdates = useCallback(async () => {
    try {
      const result = await getClientUpdates();
      setUpdates(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the update for ${name}?`)) return;
    try {
      await deleteClientUpdate(id);
      fetchUpdates();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = updates.findIndex((u) => u.id === active.id);
      const newIndex = updates.findIndex((u) => u.id === over.id);

      const nextOrder = arrayMove(updates, oldIndex, newIndex);
      setUpdates(nextOrder);

      // Save to server
      try {
        await reorderClientUpdates(
          nextOrder.map((u, i) => ({ id: u.id, position: i }))
        );
      } catch (err) {
        console.error("Failed to save new order:", err);
      }
    }
  };

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Client Updates</h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <FileText className="h-4 w-4 text-primary/60" />
            Drag and drop rows to customize your client update order.
          </p>
        </div>
        {!loading && (
          <div className="flex justify-start sm:justify-end">
            <CreateUpdateDialog onSaved={fetchUpdates} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted/50 p-12 lg:p-20 transition-all hover:bg-muted/5">
          <div className="rounded-full bg-muted/20 p-4">
            <FileText className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground/80">No updates yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start by adding notes for your first client.</p>
          </div>
          <CreateUpdateDialog onSaved={fetchUpdates} />
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Header Row - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 bg-muted/30 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
            <div className="w-[4%]"></div> {/* Drag handle placeholder */}
            <div className="w-[18%]">Client</div>
            <div className="w-[34%]">Last Discussion</div>
            <div className="w-[34%]">Next Steps</div>
            <div className="w-[10%] text-right pr-2">Actions</div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={updates.map(u => u.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-border">
                {updates.map((update) => (
                  <SortableRow 
                    key={update.id} 
                    update={update} 
                    onDelete={handleDelete}
                    onSaved={fetchUpdates}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

interface SortableRowProps {
  update: ClientUpdate;
  onDelete: (id: string, name: string) => void;
  onSaved: () => void;
}

function SortableRow({ update, onDelete, onSaved }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: update.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex flex-col md:flex-row md:items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/50 ${isDragging ? "bg-accent shadow-lg ring-1 ring-primary/20" : ""}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="hidden md:flex items-center w-[4%] cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Client Cell */}
      <div className="md:w-[18%] space-y-1">
        <div className="font-bold text-foreground leading-tight truncate">{update.client_name}</div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <Calendar className="h-3 w-3" />
          {format(parseISO(update.created_at), "MMM d, yyyy")}
        </div>
      </div>

      {/* Discussion Cell */}
      <div className="md:w-[34%]">
        <div className="flex items-center gap-1.5 md:hidden text-[10px] font-bold uppercase tracking-tighter text-primary/70 mb-1">
          <History className="h-3 w-3" />
          Last Discussion
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 italic leading-snug">
          {update.last_update || "No discussion notes"}
        </p>
      </div>

      {/* Next Steps Cell */}
      <div className="md:w-[34%]">
        <div className="flex items-center gap-1.5 md:hidden text-[10px] font-bold uppercase tracking-tighter text-primary/70 mb-1">
          <ListTodo className="h-3 w-3" />
          Next Steps
        </div>
        <p className="text-sm font-medium text-foreground/80 line-clamp-2 leading-snug">
          {update.next_steps || "No next steps"}
        </p>
      </div>

      {/* Actions Cell */}
      <div className="md:w-[10%] flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-60 hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <CreateUpdateDialog 
              editingUpdate={update} 
              onSaved={onSaved} 
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(update.id, update.client_name)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
