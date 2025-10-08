import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";

interface BookmarkedVerse {
  reference: string;
  text: string;
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setBookmarks(saved);
  };

  const handleDelete = (index: number) => {
    const updated = bookmarks.filter((_, i) => i !== index);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
    setBookmarks(updated);
    toast.success("Removed from bookmarks");
  };

  const handleShare = (verse: BookmarkedVerse) => {
    const shareText = `${verse.text}\n\n— ${verse.reference}`;
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Verse copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Saved Verses
          </h1>
          <p className="text-muted-foreground">
            Your bookmarked verses and favorites
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-display font-semibold mb-2">
              No bookmarks yet
            </h3>
            <p className="text-muted-foreground">
              Start saving your favorite verses while reading
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((verse, index) => (
              <Card
                key={index}
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-primary mb-2">
                      {verse.reference}
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {verse.text}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShare(verse)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(index)}
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
