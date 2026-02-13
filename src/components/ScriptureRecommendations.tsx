import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getRecommendations } from "@/lib/scriptureRecommendations";

interface ScriptureRecommendationsProps {
  book: string;
  chapter: number;
}

export function ScriptureRecommendations({ book, chapter }: ScriptureRecommendationsProps) {
  const recs = getRecommendations(book, chapter);

  if (!recs.length) return null;

  return (
    <Card className="glass-card p-5 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Go Deeper</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Passages that connect with {book} {chapter}:
      </p>
      <div className="space-y-2">
        {recs.map((rec) => {
          // Parse reference to get book and chapter for link
          const match = rec.reference.match(/^(.+?)\s+(\d+)$/);
          const linkBook = match?.[1] || rec.reference;
          const linkChapter = match?.[2] || "1";

          return (
            <Link
              key={rec.reference}
              to={`/bible?book=${encodeURIComponent(linkBook)}&chapter=${linkChapter}`}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{rec.reference}</p>
                  <p className="text-xs text-muted-foreground truncate">{rec.reason}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
