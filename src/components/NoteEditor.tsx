import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Trash2 } from "lucide-react";
import { Note, saveNote, updateNote, deleteNote } from "@/lib/notesStorage";
import { toast } from "sonner";

interface NoteEditorProps {
  book: string;
  chapter: number;
  verse?: number;
  existingNote?: Note;
  onClose: () => void;
  onSave: () => void;
}

export const NoteEditor = ({ book, chapter, verse, existingNote, onClose, onSave }: NoteEditorProps) => {
  const [content, setContent] = useState(existingNote?.content || "");
  const [saving, setSaving] = useState(false);

  const reference = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please write something first");
      return;
    }

    setSaving(true);
    try {
      if (existingNote) {
        await updateNote(existingNote.id, content);
        toast.success("Note updated");
      } else {
        await saveNote({ book, chapter, verse, content });
        toast.success("Note saved");
      }
      onSave();
      onClose();
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNote) return;
    
    try {
      await deleteNote(existingNote.id);
      toast.success("Note deleted");
      onSave();
      onClose();
    } catch {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg mx-4 mb-4 md:mb-0 glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              {existingNote ? "Edit Note" : "Add Note"}
            </h3>
            <p className="text-sm text-muted-foreground">{reference}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          placeholder="Write your reflection..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px] resize-none bg-background/50 border-border/50 focus:border-primary/50 mb-4"
          autoFocus
        />

        <div className="flex items-center justify-between">
          {existingNote && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-primary-glow">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
