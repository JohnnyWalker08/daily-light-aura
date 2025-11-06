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
    const cacheKey = "verse-of-the-day";
    
    // Try to load from cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setVerse(JSON.parse(cached));
      setLoading(false);
    }
    
    // Fetch verse of the day - using John 3:16 as featured verse
    fetch("https://bible-api.com/john 3:16")
      .then((res) => res.json())
      .then((data) => {
        const verseData = {
          reference: data.reference,
          text: data.text.trim(),
        };
        setVerse(verseData);
        localStorage.setItem(cacheKey, JSON.stringify(verseData));
        setLoading(false);
      })
      .catch(() => {
        // Only set fallback if we don't have cached data
        if (!cached) {
          setVerse({
            reference: "John 3:16",
            text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
          });
        }
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
    <div className="relative overflow-hidden rounded-3xl animate-fade-in-up shadow-[0_20px_80px_-20px_rgba(99,102,241,0.4)]">
      {/* Background with Divine Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-deep to-primary/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Content */}
      <Card className="relative border-0 bg-transparent p-10 md:p-16">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
            <span className="text-2xl animate-pulse">✨</span>
            <h2 className="text-sm font-display font-bold uppercase tracking-widest text-accent">
              Divine Word of the Day
            </h2>
          </div>

          {/* Verse Quote */}
          <blockquote className="relative">
            <svg className="absolute -top-6 -left-4 w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 32 32">
              <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
            </svg>
            <p className="text-2xl md:text-4xl font-serif font-medium text-white leading-relaxed max-w-4xl mx-auto px-4">
              {verse?.text}
            </p>
            <svg className="absolute -bottom-6 -right-4 w-12 h-12 text-white/20 rotate-180" fill="currentColor" viewBox="0 0 32 32">
              <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
            </svg>
          </blockquote>

          {/* Reference */}
          <div className="pt-2">
            <p className="text-accent font-bold text-xl tracking-wide">
              — {verse?.reference}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button
              size="lg"
              onClick={handleShare}
              className="group bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 font-semibold px-8 shadow-lg"
            >
              <Share2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Share Verse
            </Button>
            <Button
              size="lg"
              onClick={handleBookmark}
              className={`group backdrop-blur-xl border-2 font-semibold px-8 shadow-lg transition-all duration-300 hover:scale-105 ${
                isBookmarked 
                  ? "bg-accent/30 border-accent text-white hover:bg-accent/40" 
                  : "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              }`}
            >
              <Bookmark className={`mr-2 h-5 w-5 transition-all ${isBookmarked ? "fill-white scale-110" : "group-hover:scale-110"}`} />
              {isBookmarked ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
