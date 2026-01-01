import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Bookmark, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getChapter, saveChapter } from "@/lib/offlineBible";
import { markChapterAsRead, isChapterRead } from "@/lib/progressStorage";
import { getNotesForChapter, Note } from "@/lib/notesStorage";
import { NoteEditor } from "@/components/NoteEditor";

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
];

export default function Bible() {
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState("1");
  const [verses, setVerses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chapterRead, setChapterRead] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteEditor, setNoteEditor] = useState<{ verse?: number } | null>(null);

  useEffect(() => {
    loadChapter();
    loadNotes();
    setChapterRead(isChapterRead(book, parseInt(chapter)));
  }, [book, chapter]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const offlineData = await getChapter(book, parseInt(chapter));
      if (offlineData) {
        setVerses(offlineData);
        setLoading(false);
        return;
      }
      const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
      const data = await response.json();
      setVerses(data);
      await saveChapter(book, parseInt(chapter), data);
    } catch {
      toast.error("Failed to load chapter");
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    const chapterNotes = await getNotesForChapter(book, parseInt(chapter));
    setNotes(chapterNotes);
  };

  const handleBookmark = (verseNum: number, text: string) => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    bookmarks.push({ reference: `${book} ${chapter}:${verseNum}`, text });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    toast.success("Verse bookmarked!");
  };

  const handleMarkRead = () => {
    markChapterAsRead(book, parseInt(chapter));
    setChapterRead(true);
    toast.success("Chapter marked as read!");
  };

  const hasNoteForVerse = (verse: number) => notes.some(n => n.verse === verse);

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Read the Bible</h1>
          <p className="text-muted-foreground">Immerse yourself in God's word</p>
        </div>

        <Card className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={book} onValueChange={setBook}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="icon" onClick={() => setChapter(String(Math.max(1, parseInt(chapter) - 1)))} disabled={parseInt(chapter) <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 150 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setChapter(String(parseInt(chapter) + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setNoteEditor({})} title="Add chapter note">
                <FileText className="h-4 w-4 mr-2" />Note
              </Button>
              <Button variant={chapterRead ? "secondary" : "default"} size="sm" onClick={handleMarkRead} disabled={chapterRead} className={!chapterRead ? "bg-gradient-to-r from-primary to-primary-glow" : ""}>
                <CheckCircle2 className="h-4 w-4 mr-2" />{chapterRead ? "Read" : "Mark Read"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-8">
          {loading ? (
            <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />)}</div>
          ) : verses ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">{verses.reference}</h2>
              {verses.verses?.map((verse: any) => (
                <div key={verse.verse} className="group flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors relative">
                  <span className="text-primary font-semibold text-sm min-w-[2rem]">{verse.verse}</span>
                  <p className="text-foreground leading-relaxed flex-1">{verse.text}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setNoteEditor({ verse: verse.verse })} className={hasNoteForVerse(verse.verse) ? "text-primary" : ""}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleBookmark(verse.verse, verse.text)}>
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                  {hasNoteForVerse(verse.verse) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 rounded-l-lg" />}
                </div>
              ))}
            </div>
          ) : <p className="text-center text-muted-foreground">Select a book and chapter to start reading</p>}
        </Card>

        {noteEditor && (
          <NoteEditor book={book} chapter={parseInt(chapter)} verse={noteEditor.verse} onClose={() => setNoteEditor(null)} onSave={loadNotes} />
        )}
      </div>
    </div>
  );
}
