import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { toast } from "sonner";

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "Matthew", "Mark", "Luke", "John", "Romans",
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
    try {
      const response = await fetch(`https://bible-api.com/${book}+${chapter}`);
      const data = await response.json();
      setVerses(data);
    } catch (error) {
      toast.error("Failed to load chapter");
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
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Read the Bible
          </h1>
          <p className="text-muted-foreground">
            Immerse yourself in God's word
          </p>
        </div>

        {/* Chapter Navigation */}
        <Card className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={book} onValueChange={setBook}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setChapter(String(Math.max(1, parseInt(chapter) - 1)))}
                disabled={parseInt(chapter) <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setChapter(String(parseInt(chapter) + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Verses */}
        <Card className="glass-card p-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : verses ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                {verses.reference}
              </h2>
              
              {verses.verses?.map((verse: any) => (
                <div
                  key={verse.verse}
                  className="group flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-primary font-semibold text-sm min-w-[2rem]">
                    {verse.verse}
                  </span>
                  <p className="text-foreground leading-relaxed flex-1">
                    {verse.text}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleBookmark(verse.verse, verse.text)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Select a book and chapter to start reading
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
