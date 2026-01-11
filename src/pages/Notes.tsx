import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Calendar, Trash2, Edit3, ChevronDown } from "lucide-react";
import { Note, getAllNotes, deleteNote } from "@/lib/notesStorage";
import { NoteEditor } from "@/components/NoteEditor";
import { toast } from "sonner";
import { getUserSettings, onSettingsChange } from "@/lib/settingsStorage";

export default function Notes() {
  const [settings, setSettings] = useState(() => getUserSettings());
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<string[]>([]);

  const loadNotes = async () => {
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    return onSettingsChange(() => setSettings(getUserSettings()));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      toast.success("Note deleted");
      loadNotes();
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const toggleBook = (book: string) => {
    setExpandedBooks(prev => 
      prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book]
    );
  };

  // Group notes by book
  const notesByBook = notes.reduce((acc, note) => {
    if (!acc[note.book]) acc[note.book] = [];
    acc[note.book].push(note);
    return acc;
  }, {} as { [key: string]: Note[] });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getReference = (note: Note) => {
    return note.verse ? `${note.book} ${note.chapter}:${note.verse}` : `${note.book} ${note.chapter}`;
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Notes & Reflections
          </h1>
          <p className="text-muted-foreground">
            Your personal journey through Scripture
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <Card className="glass-card p-12 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
              No Notes Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start capturing your reflections while reading. Tap the note icon on any verse or chapter.
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-primary-glow">
              <a href="/bible">
                <BookOpen className="h-4 w-4 mr-2" />
                Start Reading
              </a>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(notesByBook).map(([book, bookNotes]) => (
              <Card key={book} className="glass-card overflow-hidden animate-fade-in-up">
                <button
                  onClick={() => toggleBook(book)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-semibold text-foreground">{book}</h3>
                      <p className="text-sm text-muted-foreground">{bookNotes.length} note{bookNotes.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedBooks.includes(book) ? 'rotate-180' : ''}`} />
                </button>

                {expandedBooks.includes(book) && (
                  <div className="border-t border-border/50">
                    {bookNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-sm font-medium text-primary">
                              {getReference(note)}
                            </span>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex-inline items-center gap-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {formatDate(note.updatedAt)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingNote(note)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(note.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p
                          className="text-foreground leading-relaxed whitespace-pre-wrap"
                          style={{
                            fontSize: settings.fontSize === "large" ? 19 : settings.fontSize === "xlarge" ? 21 : 16,
                            fontFamily: settings.fontFamily === "serif" ? "Georgia, ui-serif, serif" : undefined,
                          }}
                        >
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {editingNote && (
          <NoteEditor
            book={editingNote.book}
            chapter={editingNote.chapter}
            verse={editingNote.verse}
            existingNote={editingNote}
            onClose={() => setEditingNote(null)}
            onSave={loadNotes}
          />
        )}
      </div>
    </div>
  );
}
