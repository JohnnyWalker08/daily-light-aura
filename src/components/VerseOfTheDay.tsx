import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import heroBackground from "@/assets/hero-background.jpg";

interface Verse {
  reference: string;
  text: string;
}

export const VerseOfTheDay = () => {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Fetch verse of the day - using John 3:16 as featured verse
    fetch("https://bible-api.com/john 3:16")
      .then((res) => res.json())
      .then((data) => {
        setVerse({
          reference: data.reference,
          text: data.text.trim(),
        });
        setLoading(false);
      })
      .catch(() => {
        setVerse({
          reference: "John 3:16",
          text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        });
        setLoading(false);
      });

    // Check if bookmarked
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setIsBookmarked(bookmarks.some((b: Verse) => b.reference === "John 3:16"));
  }, []);

  const handleShare = () => {
    if (verse) {
      const shareText = `${verse.text}\n\n— ${verse.reference}`;
      if (navigator.share) {
        navigator.share({ text: shareText });
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success("Verse copied to clipboard!");
      }
    }
  };

  const handleBookmark = () => {
    if (!verse) return;
    
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    
    if (isBookmarked) {
      const filtered = bookmarks.filter((b: Verse) => b.reference !== verse.reference);
      localStorage.setItem("bookmarks", JSON.stringify(filtered));
      setIsBookmarked(false);
      toast.success("Removed from bookmarks");
    } else {
      bookmarks.push(verse);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
      toast.success("Added to bookmarks");
    }
  };

  if (loading) {
    return (
      <Card className="glass-card p-8 animate-pulse">
        <div className="h-40 bg-muted rounded-lg"></div>
      </Card>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl animate-fade-in-up">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90"></div>
      </div>

      {/* Content */}
      <Card className="relative glass-card border-0 bg-transparent backdrop-blur-xl p-8 md:p-12">
        <div className="text-center space-y-6">
          <div className="inline-block">
            <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-accent mb-2 animate-pulse-glow">
              ✨ Verse of the Day
            </h2>
          </div>

          <blockquote className="text-xl md:text-3xl font-display font-medium text-white leading-relaxed max-w-3xl mx-auto animate-float">
            "{verse?.text}"
          </blockquote>

          <p className="text-accent font-semibold text-lg">
            — {verse?.reference}
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="glass-card border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleBookmark}
              className={`glass-card border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all ${
                isBookmarked ? "bg-accent/20 border-accent" : ""
              }`}
            >
              <Bookmark className={`mr-2 h-5 w-5 ${isBookmarked ? "fill-accent" : ""}`} />
              {isBookmarked ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
