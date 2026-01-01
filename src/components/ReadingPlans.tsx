import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Play, CheckCircle2, ChevronRight, BookOpen, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  READING_PLANS, 
  getUserPlanProgress, 
  startPlan, 
  markDayComplete, 
  getActivePlans,
  resetPlan,
  ReadingPlan,
  UserPlanProgress,
  PlanReading
} from "@/lib/plansStorage";
import { toast } from "sonner";

export const TodaysReadingCard = () => {
  const [activePlans, setActivePlans] = useState<{ plan: ReadingPlan; progress: UserPlanProgress; todaysReading: PlanReading | null }[]>([]);

  useEffect(() => {
    setActivePlans(getActivePlans());
  }, []);

  if (activePlans.length === 0) return null;

  return (
    <Card className="glass-card p-6 animate-fade-in-up overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Today's Reading</h3>
          <p className="text-sm text-muted-foreground">Your daily journey awaits</p>
        </div>
      </div>

      <div className="space-y-4">
        {activePlans.map(({ plan, progress, todaysReading }) => {
          const completedPercentage = Math.round((progress.completedDays.length / plan.totalDays) * 100);
          const isCompleted = progress.completedDays.includes(progress.currentDay);

          return (
            <div key={plan.id} className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{plan.title}</span>
                <span className="text-xs text-muted-foreground">Day {progress.currentDay}/{plan.totalDays}</span>
              </div>
              
              <Progress value={completedPercentage} className="h-1.5 mb-3" />
              
              {todaysReading && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {todaysReading.passages.slice(0, 2).join(", ")}
                    {todaysReading.passages.length > 2 && ` +${todaysReading.passages.length - 2} more`}
                  </div>
                  <Link to={`/plans/${plan.id}`}>
                    <Button 
                      size="sm" 
                      variant={isCompleted ? "outline" : "default"}
                      className={!isCompleted ? `bg-gradient-to-r ${plan.gradient}` : ""}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Done
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-1" />
                          Read
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/plans" className="block mt-4">
        <Button variant="ghost" className="w-full text-primary">
          View All Plans
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </Card>
  );
};

interface PlanCardProps {
  plan: ReadingPlan;
  onStart?: () => void;
}

export const PlanCard = ({ plan, onStart }: PlanCardProps) => {
  const [progress, setProgress] = useState<UserPlanProgress | null>(null);

  useEffect(() => {
    setProgress(getUserPlanProgress(plan.id));
  }, [plan.id]);

  const handleStart = () => {
    startPlan(plan.id);
    setProgress(getUserPlanProgress(plan.id));
    toast.success(`Started: ${plan.title}`);
    onStart?.();
  };

  const handleReset = () => {
    resetPlan(plan.id);
    setProgress(null);
    toast.success("Plan reset");
  };

  const completedPercentage = progress 
    ? Math.round((progress.completedDays.length / plan.totalDays) * 100)
    : 0;

  return (
    <Card className="glass-card p-6 hover:shadow-lg transition-all animate-fade-in-up group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
        <Calendar className="h-7 w-7 text-primary-foreground" />
      </div>

      <h3 className="text-xl font-display font-bold text-foreground mb-2">
        {plan.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{plan.description}</p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
        <BookOpen className="h-4 w-4" />
        <span>{plan.totalDays} days</span>
      </div>

      {progress ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Day {progress.currentDay} of {plan.totalDays}</span>
            <span className="font-medium text-foreground">{completedPercentage}%</span>
          </div>
          <Progress value={completedPercentage} className="h-2" />
          <div className="flex gap-2">
            <Link to={`/plans/${plan.id}`} className="flex-1">
              <Button className={`w-full bg-gradient-to-r ${plan.gradient}`}>
                <Play className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={handleReset} title="Reset progress">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleStart} className={`w-full bg-gradient-to-r ${plan.gradient}`}>
          <Play className="h-4 w-4 mr-2" />
          Start Plan
        </Button>
      )}
    </Card>
  );
};

export const AllPlans = () => {
  const [, setRefresh] = useState(0);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {READING_PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onStart={() => setRefresh(r => r + 1)} />
      ))}
    </div>
  );
};
