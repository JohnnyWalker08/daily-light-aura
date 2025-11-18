import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { toast } from "sonner";

// Complete Bible - 66 Books (39 OT + 27 NT)
const BOOKS = [
  // Old Testament (39 books)
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  // New Testament (27 books)
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

export default function Bible() {
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState("1");
  const [verses, setVerses] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChapter();
  }, [book, chapter]);

  const loadChapter = async () => {
    setLoading(true);
    const cacheKey = `bible-${book}-${chapter}`;
    
    try {
      // Try to load from cache first for instant display
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setVerses(JSON.parse(cached));
        setLoading(false);
      }
      
      // Try to fetch fresh data from API (using KJV - King James Version, public domain)
      const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
      const data = await response.json();
      
      // Cache the data for offline use
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setVerses(data);
    } catch (error) {
      // If we already showed cached data, just inform user
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        toast.info("Showing offline version");
      } else {
        toast.error("This chapter is not available offline yet. View it once while online to cache it.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (verseNum: number, text: string) => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    const verseRef = `${book} ${chapter}:${verseNum}`;
    
    bookmarks.push({
      reference: verseRef,
      text: text,
    });
    
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    toast.success("Verse bookmarked!");
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8 sacred-pattern">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold gradient-text mb-3">
            Sacred Scriptures
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Immerse yourself in the divine word of God
          </p>
        </div>

        {/* Chapter Navigation */}
        <Card className="verse-card p-6 md:p-8 mb-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Select value={book} onValueChange={setBook}>
              <SelectTrigger className="w-full md:w-[240px] h-12 text-lg font-serif border-2 border-primary/20 hover:border-primary/40 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKS.map((b) => (
                  <SelectItem key={b} value={b} className="text-lg font-serif">
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all"
                onClick={() => setChapter(String(Math.max(1, parseInt(chapter) - 1)))}
                disabled={parseInt(chapter) <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger className="w-28 h-12 text-lg font-serif border-2 border-primary/20 hover:border-primary/40 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)} className="text-lg">
                      Chapter {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all"
                onClick={() => setChapter(String(parseInt(chapter) + 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Verses Reading Area */}
        <Card className="verse-card backdrop-blur-xl">
          {loading ? (
            <div className="p-8 md:p-12 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-12 bg-primary/10 rounded animate-pulse" />
                  <div className="h-24 bg-muted/30 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : verses ? (
            <div className="p-8 md:p-12">
              {/* Chapter Title */}
              <div className="mb-10 pb-6 border-b-2 border-primary/10">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                  {verses.reference}
                </h2>
                <p className="text-muted-foreground italic">
                  {verses.verses?.length} verses
                </p>
              </div>
              
              {/* Verses */}
              <div className="space-y-8">
                {verses.verses?.map((verse: any) => (
                  <div
                    key={verse.verse}
                    className="group relative"
                  >
                    <div className="flex gap-4 items-start">
                      <span className="verse-number sticky top-24 flex-shrink-0 mt-1.5 select-none">
                        {verse.verse}
                      </span>
                      <div className="flex-1">
                        <p className="verse-text text-foreground">
                          {verse.text}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all hover:text-accent hover:bg-accent/10 hover:scale-110"
                        onClick={() => handleBookmark(verse.verse, verse.text)}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-lg text-muted-foreground font-serif italic">
                Select a book and chapter to begin your sacred reading
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
