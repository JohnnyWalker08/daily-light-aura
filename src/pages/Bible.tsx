import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  FileText, 
  CheckCircle2,
  Highlighter,
  X,
  ArrowLeft,
  Settings2
} from "lucide-react";
import { ReaderSettingsPanel } from "@/components/ReaderSettingsPanel";
import { ScriptureRecommendations } from "@/components/ScriptureRecommendations";
import { toast } from "sonner";
import { getChapter, saveChapter } from "@/lib/offlineBible";
import { markChapterAsRead, isChapterRead } from "@/lib/progressStorage";
import { getNotesForChapter, Note } from "@/lib/notesStorage";
import {
  getHighlightsForChapter,
  highlightVerse,
  removeHighlight,
  HIGHLIGHT_COLORS,
  HighlightColor,
  VerseHighlight,
} from "@/lib/highlightStorage";
import { getUserSettings, onSettingsChange } from "@/lib/settingsStorage";
import { NoteEditor } from "@/components/NoteEditor";
import { markDayComplete, getUserPlanProgress, READING_PLANS } from "@/lib/plansStorage";

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

const BOOK_CHAPTERS: Record<string, number> = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
  "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14,
  "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3,
  "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16,
  "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6,
  "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13,
  "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
  "3 John": 1, "Jude": 1, "Revelation": 22,
};

export default function Bible() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get params for reading plan navigation
  const paramBook = searchParams.get('book');
  const paramChapter = searchParams.get('chapter');
  const planId = searchParams.get('plan');
  const planDay = searchParams.get('day');
  
  const [book, setBook] = useState(paramBook || "John");
  const [chapter, setChapter] = useState(paramChapter || "1");
  const [verses, setVerses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chapterRead, setChapterRead] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [noteEditor, setNoteEditor] = useState<{ verse?: number } | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [translation, setTranslation] = useState(() => getUserSettings().translation);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Update book/chapter from URL params
  useEffect(() => {
    if (paramBook) setBook(paramBook);
    if (paramChapter) setChapter(paramChapter);
  }, [paramBook, paramChapter]);

  useEffect(() => {
    loadChapter();
    loadNotes();
    loadHighlights();
    setChapterRead(isChapterRead(book, parseInt(chapter)));
  }, [book, chapter, translation]);

  useEffect(() => {
    return onSettingsChange(() => {
      setTranslation(getUserSettings().translation);
    });
  }, []);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const offlineData = await getChapter(book, parseInt(chapter));
      if (offlineData) {
        setVerses(offlineData);
        setLoading(false);
        return;
      }
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`
      );
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

  const loadHighlights = () => {
    setHighlights(getHighlightsForChapter(book, parseInt(chapter)));
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
    
    // If in reading plan mode, check if we should complete the day
    if (planId && planDay) {
      const plan = READING_PLANS.find(p => p.id === planId);
      const dayNum = parseInt(planDay);
      if (plan) {
        const dayReading = plan.readings.find(r => r.day === dayNum);
        if (dayReading) {
          // Check if this is the last passage for the day
          const currentPassageIndex = dayReading.passages.findIndex(
            p => p === `${book} ${chapter}`
          );
          if (currentPassageIndex === dayReading.passages.length - 1) {
            markDayComplete(planId, dayNum);
            toast.success(`Day ${dayNum} completed!`);
          }
        }
      }
    }
  };

  const handleHighlight = (color: HighlightColor) => {
    if (selectedVerse !== null) {
      highlightVerse(book, parseInt(chapter), selectedVerse, color);
      loadHighlights();
      setShowHighlightPicker(false);
      setSelectedVerse(null);
      toast.success("Verse highlighted!");
    }
  };

  const handleRemoveHighlight = () => {
    if (selectedVerse !== null) {
      removeHighlight(book, parseInt(chapter), selectedVerse);
      loadHighlights();
      setShowHighlightPicker(false);
      setSelectedVerse(null);
      toast.success("Highlight removed");
    }
  };

  const getHighlightForVerse = (verseNum: number) => {
    return highlights.find(h => h.verse === verseNum);
  };

  const hasNoteForVerse = (verse: number) => notes.some(n => n.verse === verse);

  const handleVerseClick = (verseNum: number) => {
    setSelectedVerse(verseNum);
    setShowHighlightPicker(true);
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    const currentChapter = parseInt(chapter);
    const maxChapters = BOOK_CHAPTERS[book] || 150;
    
    if (direction === 'prev' && currentChapter > 1) {
      setChapter(String(currentChapter - 1));
    } else if (direction === 'next' && currentChapter < maxChapters) {
      setChapter(String(currentChapter + 1));
    }
  };

  // Get next passage for reading plan mode
  const getNextPlanPassage = () => {
    if (!planId || !planDay) return null;
    const plan = READING_PLANS.find(p => p.id === planId);
    const dayNum = parseInt(planDay);
    if (!plan) return null;
    
    const dayReading = plan.readings.find(r => r.day === dayNum);
    if (!dayReading) return null;
    
    const currentPassageIndex = dayReading.passages.findIndex(
      p => p === `${book} ${chapter}`
    );
    
    if (currentPassageIndex < dayReading.passages.length - 1) {
      return dayReading.passages[currentPassageIndex + 1];
    }
    return null;
  };

  const handleNextPassage = () => {
    const nextPassage = getNextPlanPassage();
    if (nextPassage) {
      const match = nextPassage.match(/^(.+?)\s+(\d+)$/);
      if (match) {
        navigate(`/bible?book=${encodeURIComponent(match[1])}&chapter=${match[2]}&plan=${planId}&day=${planDay}`);
      }
    }
  };

  const nextPassage = getNextPlanPassage();
  const maxChapters = BOOK_CHAPTERS[book] || 150;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Reading Plan Header */}
        {planId && planDay && (
          <div className="mb-4 animate-fade-in-up">
            <Link 
              to={`/plans/${planId}`} 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plan (Day {planDay})
            </Link>
          </div>
        )}

        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Read the Bible</h1>
          <p className="text-muted-foreground">Immerse yourself in God's word</p>
        </div>

        {/* Navigation Controls */}
        <Card className="glass-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Select value={book} onValueChange={(b) => { setBook(b); setChapter("1"); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateChapter('prev')} 
                disabled={parseInt(chapter) <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxChapters }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateChapter('next')}
                disabled={parseInt(chapter) >= maxChapters}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" size="sm" onClick={() => setNoteEditor({})} title="Add chapter note">
                <FileText className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Note</span>
              </Button>
              <Button 
                variant={chapterRead ? "secondary" : "default"} 
                size="sm" 
                onClick={handleMarkRead} 
                disabled={chapterRead} 
                className={!chapterRead ? "bg-gradient-to-r from-primary to-primary-glow" : ""}
              >
                <CheckCircle2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{chapterRead ? "Read" : "Mark Read"}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Settings Toggle Button - floating in corner */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettingsPanel(true)}
          className="fixed top-24 right-4 z-30 h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
          title="Reading settings"
        >
          <Settings2 className="h-5 w-5" />
        </Button>

        {/* Verse Content - Improved Readability */}
        <Card className="glass-card p-6 sm:p-8">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : verses ? (
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8">
                {verses.reference}
              </h2>
              
              {/* Improved verse layout - full width, flowing text */}
              <div 
                className="space-y-6" 
                style={{ 
                  fontFamily: "var(--reader-font-family)",
                  fontSize: "var(--reader-font-size)",
                  lineHeight: "var(--reader-line-height, 1.75)"
                }}
              >
                {verses.verses?.map((verse: any) => {
                  const highlight = getHighlightForVerse(verse.verse);
                  const highlightBg = highlight 
                    ? HIGHLIGHT_COLORS.find(c => c.color === highlight.color)?.bg 
                    : '';
                  
                  return (
                    <div 
                      key={verse.verse} 
                      className={`group relative rounded-lg transition-colors ${highlightBg}`}
                    >
                      <div 
                        className="cursor-pointer py-1"
                        onClick={() => handleVerseClick(verse.verse)}
                      >
                        <span className="text-primary font-bold mr-2 align-super" style={{ fontSize: "0.85em" }}>
                          {verse.verse}
                        </span>
                        <span className="text-foreground leading-relaxed">
                          {verse.text}
                        </span>
                      </div>
                      
                      {/* Quick actions on hover */}
                      <div className="absolute right-0 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-lg p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); handleVerseClick(verse.verse); }}
                        >
                          <Highlighter className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${hasNoteForVerse(verse.verse) ? "text-primary" : ""}`}
                          onClick={(e) => { e.stopPropagation(); setNoteEditor({ verse: verse.verse }); }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); handleBookmark(verse.verse, verse.text); }}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {hasNoteForVerse(verse.verse) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 rounded-l-lg" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Select a book and chapter to start reading
            </p>
          )}
        </Card>

        {/* Scripture Recommendations - shown after reading */}
        {verses && chapterRead && (
          <ScriptureRecommendations book={book} chapter={parseInt(chapter)} />
        )}

        {/* Bottom Navigation - Prev only on chapter > 1, Next only on last chapter */}
        <div className="mt-8 mb-4">
          <Card className="glass-card p-3 flex items-center justify-between">
            {/* Previous - only show if not first chapter */}
            {parseInt(chapter) > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('prev')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            ) : (
              <div className="w-20" /> 
            )}
            
            {/* Center: Mark as Read or Next Passage */}
            {nextPassage ? (
              <Button
                size="sm"
                onClick={handleNextPassage}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                Next: {nextPassage}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant={chapterRead ? "secondary" : "default"}
                size="sm"
                onClick={handleMarkRead}
                disabled={chapterRead}
                className={!chapterRead ? "bg-gradient-to-r from-primary to-primary-glow" : ""}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {chapterRead ? "Completed" : "Mark as Read"}
              </Button>
            )}
            
            {/* Next - only show if not last chapter */}
            {parseInt(chapter) < maxChapters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateChapter('next')}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <div className="w-16" />
            )}
          </Card>
        </div>

        {/* Highlight Color Picker */}
        {showHighlightPicker && selectedVerse !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <Card className="glass-card p-6 w-full max-w-sm animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">
                  Highlight Verse {selectedVerse}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setShowHighlightPicker(false); setSelectedVerse(null); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-5 gap-3 mb-4">
                {HIGHLIGHT_COLORS.map(({ color, bg, name }) => (
                  <button
                    key={color}
                    onClick={() => handleHighlight(color)}
                    className={`w-12 h-12 rounded-xl ${bg} border-2 border-transparent hover:border-foreground/30 transition-all hover:scale-105`}
                    title={name}
                  />
                ))}
              </div>
              
              {getHighlightForVerse(selectedVerse) && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleRemoveHighlight}
                >
                  Remove Highlight
                </Button>
              )}
            </Card>
          </div>
        )}

        {noteEditor && (
          <NoteEditor 
            book={book} 
            chapter={parseInt(chapter)} 
            verse={noteEditor.verse} 
            onClose={() => setNoteEditor(null)} 
            onSave={loadNotes} 
          />
        )}

        {/* Reader Settings Panel */}
        <ReaderSettingsPanel 
          isOpen={showSettingsPanel} 
          onClose={() => setShowSettingsPanel(false)} 
        />
      </div>
    </div>
  );
}
