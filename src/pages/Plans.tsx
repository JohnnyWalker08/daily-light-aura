import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    title: "Faith Journey",
    description: "7 days exploring the foundations of faith",
    days: 7,
    gradient: "from-primary to-primary-glow",
  },
  {
    title: "Hope & Peace",
    description: "Finding peace through scripture",
    days: 7,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "Strength & Courage",
    description: "Discover your inner strength in God",
    days: 7,
    gradient: "from-orange-500 to-amber-400",
  },
  {
    title: "Wisdom & Understanding",
    description: "Growing in divine wisdom",
    days: 7,
    gradient: "from-purple-500 to-pink-400",
  },
];

export default function Plans() {
  const handleStart = (planTitle: string) => {
    toast.success(`Started: ${planTitle}!`);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Reading Plans
          </h1>
          <p className="text-muted-foreground">
            Guided devotional journeys for spiritual growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={plan.title}
              className="glass-card p-8 hover:shadow-xl transition-all animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6`}
              >
                <Calendar className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-2xl font-display font-bold mb-2">
                {plan.title}
              </h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <CheckCircle2 className="h-4 w-4" />
                <span>{plan.days} days</span>
              </div>

              <Button
                onClick={() => handleStart(plan.title)}
                className={`w-full bg-gradient-to-r ${plan.gradient}`}
              >
                Start Plan
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
