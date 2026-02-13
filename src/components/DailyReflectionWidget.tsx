import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, MessageCircle, PenLine, Sparkles } from "lucide-react";
import { getDailyReflection } from "@/lib/dailyReflections";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function DailyReflectionWidget() {
  const reflection = getDailyReflection();
  const { user } = useAuth();
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!journalText.trim()) return;

    if (user) {
      setSaving(true);
      const { error } = await supabase.from("reflections").insert({
        user_id: user.id,
        content: journalText.trim(),
        scripture_ref: reflection.scriptureRef,
        reflection_type: "self_examination",
      });
      setSaving(false);
      if (error) {
        toast.error("Failed to save reflection");
        return;
      }
      toast.success("Reflection saved to your journal");
    } else {
      // Save locally
      const local = JSON.parse(localStorage.getItem("local_reflections") || "[]");
      local.unshift({
        id: Date.now().toString(),
        content: journalText.trim(),
        scripture_ref: reflection.scriptureRef,
        date: new Date().toISOString(),
      });
      localStorage.setItem("local_reflections", JSON.stringify(local));
      toast.success("Reflection saved locally");
    }
    setJournalText("");
    setJournalOpen(false);
  };

  return (
    <Card className="glass-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-br-full" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            Daily Self-Examination
            <Sparkles className="h-4 w-4 text-accent" />
          </h3>
          <p className="text-xs text-muted-foreground">Check your heart against God's Word</p>
        </div>
      </div>

      {/* Question */}
      <p className="text-lg font-medium text-foreground mb-3 leading-relaxed">
        "{reflection.question}"
      </p>

      {/* Scripture */}
      <div className="bg-secondary/30 rounded-xl p-4 mb-3">
        <p className="text-sm text-foreground/90 italic leading-relaxed mb-1">
          "{reflection.scripture}"
        </p>
        <p className="text-xs text-primary font-medium">— {reflection.scriptureRef}</p>
      </div>

      {/* Practical Tip */}
      <div className="flex items-start gap-2 mb-4">
        <BookOpen className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">{reflection.tip}</p>
      </div>

      {/* Journal Entry */}
      {!journalOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setJournalOpen(true)}
          className="w-full"
        >
          <PenLine className="h-4 w-4 mr-2" />
          Write a Reflection
        </Button>
      ) : (
        <div className="space-y-3">
          <Textarea
            placeholder="How does this challenge or encourage you today?"
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="min-h-[80px] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !journalText.trim()}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setJournalOpen(false);
                setJournalText("");
              }}
            >
              Cancel
            </Button>
          </div>
          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              Saved locally. Create an account to sync across devices.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
