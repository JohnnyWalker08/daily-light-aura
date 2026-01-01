import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getTotalProgress, getBookProgress, getLastRead } from "@/lib/progressStorage";
import { BOOK_CHAPTERS } from "@/lib/offlineBible";

interface ProgressStats {
  chaptersRead: number;
  totalChapters: number;
  percentage: number;
  booksStarted: number;
  booksCompleted: number;
}

export const ReadingProgressCard = () => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [lastRead, setLastRead] = useState<{ book: string; chapter: number; date: string } | null>(null);

  useEffect(() => {
    setStats(getTotalProgress());
    setLastRead(getLastRead());
  }, []);

  if (!stats) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Your Progress</h3>
            <p className="text-sm text-muted-foreground">Keep growing</p>
          </div>
        </div>
        <Link to="/progress">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Main Progress Ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="32"
              className="fill-none stroke-muted"
              strokeWidth="8"
            />
            <circle
              cx="40" cy="40" r="32"
              className="fill-none stroke-primary"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${stats.percentage * 2.01} 201`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{stats.percentage}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{stats.chaptersRead} of {stats.totalChapters} chapters</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{stats.booksCompleted} books completed</span>
          </div>
          {lastRead && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last read: {formatDate(lastRead.date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Continue Reading */}
      {lastRead && (
        <Link to="/bible">
          <Button variant="outline" className="w-full group">
            <BookOpen className="h-4 w-4 mr-2" />
            Continue: {lastRead.book} {lastRead.chapter}
            <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}
    </Card>
  );
};

export const BookProgressList = () => {
  const books = Object.keys(BOOK_CHAPTERS);
  const oldTestament = books.slice(0, 39);
  const newTestament = books.slice(39);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Old Testament</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {oldTestament.map(book => {
            const progress = getBookProgress(book);
            return (
              <Card key={book} className="glass-card p-4 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground truncate">{book}</span>
                  <span className="text-xs text-muted-foreground">{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {progress.read}/{progress.total} chapters
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">New Testament</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {newTestament.map(book => {
            const progress = getBookProgress(book);
            return (
              <Card key={book} className="glass-card p-4 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground truncate">{book}</span>
                  <span className="text-xs text-muted-foreground">{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {progress.read}/{progress.total} chapters
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
