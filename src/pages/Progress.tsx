import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookProgressList } from "@/components/ReadingProgress";
import { getTotalProgress, getLastRead } from "@/lib/progressStorage";
import { getStreakStats, StreakBadge } from "@/lib/streaks";
import { BookOpen, Target, Award, Calendar, TrendingUp, ChevronRight, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export default function ProgressPage() {
  const [stats, setStats] = useState(getTotalProgress());
  const [lastRead, setLastRead] = useState(getLastRead());
  const streakStats = useMemo(() => getStreakStats(), []);

  useEffect(() => {
    setStats(getTotalProgress());
    setLastRead(getLastRead());
  }, []);

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
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Reading Progress
          </h1>
          <p className="text-muted-foreground">
            Track your journey through the Bible
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.percentage}%</p>
            <p className="text-sm text-muted-foreground">Complete</p>
          </Card>

          <Card className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.chaptersRead}</p>
            <p className="text-sm text-muted-foreground">Chapters Read</p>
          </Card>

          <Card className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.booksStarted}</p>
            <p className="text-sm text-muted-foreground">Books Started</p>
          </Card>

          <Card className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.booksCompleted}</p>
            <p className="text-sm text-muted-foreground">Books Completed</p>
          </Card>

          <Card className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary-glow/30 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{getStreakStats().current}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>
        </div>

        {/* Streak Card with Badge */}
        {(streakStats.current > 0 || streakStats.badge) && (
          <Card className="glass-card p-6 mb-8 animate-fade-in-up overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center gap-6 relative">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Flame className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground">{streakStats.current} day{streakStats.current !== 1 ? "s" : ""}</p>
                  <p className="text-muted-foreground">Current streak</p>
                </div>
              </div>

              {streakStats.badge && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary-glow/10 border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{streakStats.badge.name}</p>
                    <p className="text-sm text-muted-foreground">{streakStats.badge.description}</p>
                  </div>
                </div>
              )}

              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">{streakStats.best} days</p>
                <p className="text-sm text-muted-foreground">Best streak</p>
              </div>
            </div>
          </Card>
        )}

        {/* Last Read & Continue */}
        {lastRead && (
          <Card className="glass-card p-6 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Read</p>
                  <p className="text-lg font-display font-semibold text-foreground">
                    {lastRead.book} {lastRead.chapter}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDate(lastRead.date)}</p>
                </div>
              </div>
              <Link to="/bible">
                <Button className="bg-gradient-to-r from-primary to-primary-glow group">
                  Continue Reading
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Main Progress Ring */}
        <Card className="glass-card p-8 mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80" cy="80" r="70"
                  className="fill-none stroke-muted"
                  strokeWidth="12"
                />
                <circle
                  cx="80" cy="80" r="70"
                  className="fill-none stroke-primary"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.percentage * 4.4} 440`}
                  style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{stats.percentage}%</span>
                <span className="text-sm text-muted-foreground">Complete</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Your Bible Journey
              </h2>
              <p className="text-muted-foreground mb-4">
                You've read {stats.chaptersRead} of {stats.totalChapters} chapters across {stats.booksStarted} books.
                {stats.booksCompleted > 0 && ` ${stats.booksCompleted} book${stats.booksCompleted > 1 ? 's' : ''} completed!`}
              </p>
              <p className="text-sm text-muted-foreground">
                Keep going! Every chapter brings you closer to completing the Bible.
              </p>
            </div>
          </div>
        </Card>

        {/* Book Progress */}
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Progress by Book
          </h2>
          <BookProgressList />
        </div>
      </div>
    </div>
  );
}
