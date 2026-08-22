import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { BookmarkedVerse, getBookmarks, removeBookmark } from "@/lib/bookmarkStorage";
import { getTranslation } from "@/lib/translations";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const load = () => setBookmarks(getBookmarks());
  useEffect(load, []);

  const translations = useMemo(
    () => Array.from(new Set(bookmarks.map((b) => b.translation))),
    [bookmarks]
  );

  const visible = filter === "all" ? bookmarks : bookmarks.filter((b) => b.translation === filter);

  const handleDelete = (id: string) => {
    removeBookmark(id);
    load();
    toast.success("Removed from bookmarks");
  };

  const handleShare = (verse: BookmarkedVerse) => {
    const shareText = `${verse.text}\n\n— ${verse.reference} (${getTranslation(verse.translation).abbrev})`;
    if (navigator.share) navigator.share({ text: shareText });
    else {
      navigator.clipboard.writeText(shareText);
      toast.success("Verse copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Saved Verses</h1>
          <p className="text-muted-foreground">Your bookmarks, kept in the version you read them in</p>
        </div>

        {translations.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilter("all")}>
              <Badge variant={filter === "all" ? "default" : "secondary"} className="cursor-pointer">
                All
              </Badge>
            </button>
            {translations.map((id) => (
              <button key={id} onClick={() => setFilter(id)}>
                <Badge variant={filter === id ? "default" : "secondary"} className="cursor-pointer">
                  {getTranslation(id).abbrev}
                </Badge>
              </button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-display font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground">Start saving your favorite verses while reading</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {visible.map((verse, index) => (
              <Card
                key={verse.id}
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-display font-semibold text-primary">{verse.reference}</h3>
                      <Badge variant="secondary">{getTranslation(verse.translation).abbrev}</Badge>
                    </div>
                    <p className="text-foreground leading-relaxed">{verse.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleShare(verse)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(verse.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
