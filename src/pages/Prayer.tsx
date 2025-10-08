import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PrayerEntry {
  id: string;
  text: string;
  date: string;
}

export default function Prayer() {
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const saved = JSON.parse(localStorage.getItem("prayers") || "[]");
    setEntries(saved);
  };

  const handleAdd = () => {
    if (!newEntry.trim()) return;

    const entry: PrayerEntry = {
      id: Date.now().toString(),
      text: newEntry,
      date: new Date().toLocaleDateString(),
    };

    const updated = [entry, ...entries];
    localStorage.setItem("prayers", JSON.stringify(updated));
    setEntries(updated);
    setNewEntry("");
    setIsAdding(false);
    toast.success("Prayer added!");
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    localStorage.setItem("prayers", JSON.stringify(updated));
    setEntries(updated);
    toast.success("Prayer deleted");
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Prayer Journal
          </h1>
          <p className="text-muted-foreground">
            Record your prayers and reflections
          </p>
        </div>

        {/* Add New Prayer */}
        {!isAdding ? (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 bg-gradient-to-r from-primary to-primary-glow h-14 text-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Prayer
          </Button>
        ) : (
          <Card className="glass-card p-6 mb-6">
            <Textarea
              placeholder="Share your prayer or reflection..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[150px] mb-4 text-lg resize-none"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={handleAdd}
                className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
              >
                Save Prayer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewEntry("");
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Prayer Entries */}
        {entries.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-display font-semibold mb-2">
              Start Your Prayer Journal
            </h3>
            <p className="text-muted-foreground">
              Record your prayers, reflections, and answered prayers
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card
                key={entry.id}
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <span className="text-sm text-muted-foreground">
                    {entry.date}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
