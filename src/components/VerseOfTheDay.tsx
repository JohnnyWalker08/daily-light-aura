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

// Large collection of morning verses (5 AM - 12 PM)
const MORNING_VERSES = [
  "Psalm 5:3", "Psalm 90:14", "Lamentations 3:22-23", "Psalm 143:8", 
  "Psalm 118:24", "Proverbs 3:5-6", "Isaiah 40:31", "Psalm 46:5",
  "Psalm 19:14", "Psalm 63:1", "Psalm 59:16", "Psalm 88:13",
  "Psalm 92:1-2", "Psalm 130:6", "Psalm 55:17", "Mark 1:35",
  "Proverbs 8:17", "Isaiah 26:9", "Genesis 19:27", "Exodus 34:2",
  "Job 38:12", "Psalm 57:8", "Psalm 108:2", "Song of Solomon 2:12",
  "Isaiah 50:4", "Hosea 6:3", "Micah 2:1", "Zephaniah 3:5",
  "Matthew 6:33", "Romans 13:12", "Ephesians 5:14", "2 Peter 1:19",
  "Psalm 30:5", "Psalm 49:14", "Psalm 65:8", "Psalm 139:18",
  "Proverbs 4:18", "Isaiah 33:2", "Jeremiah 21:12", "Ezekiel 12:8"
];

// Large collection of evening verses (12 PM - 11 PM) 
const EVENING_VERSES = [
  "Psalm 4:8", "Matthew 11:28", "Philippians 4:6-7", "Psalm 91:1-2",
  "John 14:27", "Psalm 23:1-3", "1 Peter 5:7", "Psalm 121:3-4",
  "Psalm 3:5", "Psalm 16:7", "Psalm 42:8", "Psalm 63:6",
  "Psalm 77:6", "Psalm 119:55", "Psalm 127:2", "Psalm 134:1",
  "Proverbs 3:24", "Ecclesiastes 5:12", "Isaiah 26:3", "Isaiah 57:2",
  "Jeremiah 31:26", "Lamentations 2:19", "Daniel 2:19", "Luke 6:12",
  "Acts 16:25", "Romans 8:28", "2 Corinthians 4:16", "Hebrews 4:9",
  "Psalm 17:3", "Psalm 19:1", "Psalm 36:5", "Psalm 104:20",
  "Psalm 139:11-12", "Psalm 141:2", "Job 35:10", "Song of Solomon 3:1",
  "Zechariah 14:7", "Matthew 14:23", "Mark 6:46", "John 3:2"
];

const getVerseForTimeOfDay = () => {
  const now = new Date();
  const hour = now.getHours();
  const isMorning = hour >= 5 && hour < 12;
  const verseList = isMorning ? MORNING_VERSES : EVENING_VERSES;
  
  // Use day of year + current year to select verse so it changes daily and year-to-year
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Add year to index calculation so verses rotate each year too
  const yearOffset = now.getFullYear() % 10;
  const index = (dayOfYear + yearOffset) % verseList.length;
  
  return verseList[index];
};

export const VerseOfTheDay = () => {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const selectedVerse = getVerseForTimeOfDay();

    const raw = localStorage.getItem("dailylight_settings");
    let translation: string = "kjv";
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      translation = parsed?.translation || "kjv";
    } catch {
      translation = "kjv";
    }

    // Fetch the selected verse
    fetch(`https://bible-api.com/${selectedVerse}?translation=${translation}`)
      .then((res) => res.json())
      .then((data) => {
        setVerse({
          reference: data.reference,
          text: data.text.trim(),
        });
        setLoading(false);

        // Check if bookmarked
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
        setIsBookmarked(bookmarks.some((b: Verse) => b.reference === data.reference));
      })
      .catch(() => {
        // Fallback
        setVerse({
          reference: "Psalm 118:24",
          text: "This is the day which the LORD hath made; we will rejoice and be glad in it.",
        });
        setLoading(false);
      });
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
    const existingIndex = bookmarks.findIndex((b: Verse) => b.reference === verse.reference);
    
    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
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
