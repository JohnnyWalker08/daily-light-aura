import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  BookOpen,
  Calendar,
  ArrowLeft,
  Play
} from "lucide-react";
import { 
  READING_PLANS, 
  getUserPlanProgress, 
  markDayComplete,
  UserPlanProgress,
  ReadingPlan
} from "@/lib/plansStorage";
import { toast } from "sonner";

export default function PlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [progress, setProgress] = useState<UserPlanProgress | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const currentDayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const foundPlan = READING_PLANS.find(p => p.id === planId);
    setPlan(foundPlan || null);
    
    if (foundPlan) {
      const userProgress = getUserPlanProgress(foundPlan.id);
      setProgress(userProgress);
      if (userProgress) {
        setSelectedDay(userProgress.currentDay);
      }
    }
  }, [planId]);

  // Scroll to current day on mount
  useEffect(() => {
    if (currentDayRef.current) {
      currentDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [progress?.currentDay]);

  const handleMarkComplete = () => {
    if (!plan || !progress) return;
    
    markDayComplete(plan.id, selectedDay);
    setProgress(getUserPlanProgress(plan.id));
    toast.success(`Day ${selectedDay} completed!`);
    
    // Auto-advance to next day
    if (selectedDay < plan.totalDays) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const handleStartReading = (passage: string) => {
    // Parse passage like "Genesis 1" or "John 3"
    const match = passage.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      const book = match[1];
      const chapter = match[2];
      navigate(`/bible?book=${encodeURIComponent(book)}&chapter=${chapter}&plan=${planId}&day=${selectedDay}`);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8 flex items-center justify-center">
        <Card className="glass-card p-8 text-center">
          <p className="text-muted-foreground mb-4">Plan not found</p>
          <Link to="/plans">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentReading = plan.readings.find(r => r.day === selectedDay);
  const completedPercentage = progress 
    ? Math.round((progress.completedDays.length / plan.totalDays) * 100)
    : 0;
  const isDayCompleted = progress?.completedDays.includes(selectedDay);

  // Sort days: current day first, then incomplete days, then completed days
  const sortedReadings = [...plan.readings].sort((a, b) => {
    const aIsCurrent = a.day === progress?.currentDay;
    const bIsCurrent = b.day === progress?.currentDay;
    const aIsCompleted = progress?.completedDays.includes(a.day);
    const bIsCompleted = progress?.completedDays.includes(b.day);

    if (aIsCurrent) return -1;
    if (bIsCurrent) return 1;
    if (!aIsCompleted && bIsCompleted) return -1;
    if (aIsCompleted && !bIsCompleted) return 1;
    return a.day - b.day;
  });

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <Link to="/plans" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Plans
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
                {plan.title}
              </h1>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Day {selectedDay} of {plan.totalDays}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="glass-card p-4 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium text-foreground">{completedPercentage}%</span>
          </div>
          <Progress value={completedPercentage} className="h-2" />
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Day Selector - Sorted with current day on top */}
          <Card className="glass-card p-4 md:col-span-1 animate-fade-in-up">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center justify-between">
              <span>Days</span>
              <span className="text-xs text-muted-foreground font-normal">
                {progress?.completedDays.length || 0}/{plan.totalDays}
              </span>
            </h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-1">
                {sortedReadings.slice(0, Math.min(plan.totalDays, 100)).map((reading) => {
                  const isCompleted = progress?.completedDays.includes(reading.day);
                  const isSelected = reading.day === selectedDay;
                  const isCurrent = progress?.currentDay === reading.day;
                  
                  return (
                    <button
                      key={reading.day}
                      ref={isCurrent ? currentDayRef : undefined}
                      onClick={() => setSelectedDay(reading.day)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                          : isCurrent
                          ? 'bg-accent/10 border border-accent/30'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className={`h-5 w-5 flex-shrink-0 ${isCurrent ? 'text-accent' : 'text-muted-foreground'}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${isSelected || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Day {reading.day}
                          </p>
                          {isCurrent && !isCompleted && (
                            <span className="text-[10px] uppercase tracking-wide font-semibold bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {reading.passages[0]}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {plan.totalDays > 100 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{plan.totalDays - 100} more days
                  </p>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Today's Reading */}
          <Card className="glass-card p-6 md:col-span-2 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Day {selectedDay}
                  </h2>
                  <p className="text-sm text-muted-foreground">{currentReading?.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                  disabled={selectedDay <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDay(Math.min(plan.totalDays, selectedDay + 1))}
                  disabled={selectedDay >= plan.totalDays}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Passages List - Now clickable to navigate */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Today's Passages
              </h3>
              {currentReading?.passages.map((passage, index) => (
                <button
                  key={index}
                  onClick={() => handleStartReading(passage)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 hover:scale-[1.01] transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <span className="text-foreground font-medium">{passage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Start reading
                    </span>
                    <Play className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>

            {/* Complete Button */}
            <Button
              onClick={handleMarkComplete}
              disabled={isDayCompleted}
              className={`w-full h-12 text-base ${
                isDayCompleted 
                  ? 'bg-green-500/20 text-green-600 border border-green-500/30' 
                  : `bg-gradient-to-r ${plan.gradient}`
              }`}
            >
              {isDayCompleted ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
