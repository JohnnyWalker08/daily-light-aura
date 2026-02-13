import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, BookOpen, Heart, TrendingUp, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PERKS = [
  {
    icon: TrendingUp,
    title: "Sync Your Progress",
    description: "Your reading history, streaks, and milestones saved across all devices.",
  },
  {
    icon: Heart,
    title: "Cloud Prayer Journal",
    description: "Your prayers and reflections backed up securely — never lose them.",
  },
  {
    icon: BookOpen,
    title: "Personal Reflections",
    description: "Save daily reflections tied to Scripture for a deeper walk with God.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your data is encrypted and only visible to you. No tracking, no ads.",
  },
];

export function OnboardingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only show on home page, when not logged in
    if (user || location.pathname !== "/") return;

    const showCount = parseInt(localStorage.getItem("onboarding_show_count") || "0");
    const lastShown = localStorage.getItem("onboarding_last_shown");
    const today = new Date().toISOString().slice(0, 10);

    // Show on first visit, then sparingly (every 3 days, max 5 times)
    if (showCount === 0) {
      // First visit — show after Did You Know closes (delayed)
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("onboarding_show_count", "1");
        localStorage.setItem("onboarding_last_shown", today);
      }, 4000);
      return () => clearTimeout(timer);
    }

    if (showCount < 5 && lastShown !== today) {
      const daysSince = lastShown
        ? Math.floor((Date.now() - new Date(lastShown).getTime()) / 86400000)
        : 999;
      if (daysSince >= 3) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem("onboarding_show_count", String(showCount + 1));
          localStorage.setItem("onboarding_last_shown", today);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, location.pathname]);

  if (!isOpen || user) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="glass-card w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">Enhance Your Journey</h2>
              <p className="text-xs text-muted-foreground">
                Optional — all reading features work without an account
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 mb-6">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <perk.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{perk.title}</p>
                <p className="text-xs text-muted-foreground">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Link to="/auth" className="flex-1" onClick={() => setIsOpen(false)}>
            <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
              Create Free Account
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Not now
          </Button>
        </div>
      </Card>
    </div>
  );
}
