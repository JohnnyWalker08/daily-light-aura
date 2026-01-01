import { AllPlans, TodaysReadingCard } from "@/components/ReadingPlans";
import { getActivePlans } from "@/lib/plansStorage";
import { useState, useEffect } from "react";

export default function Plans() {
  const [hasActivePlans, setHasActivePlans] = useState(false);

  useEffect(() => {
    setHasActivePlans(getActivePlans().length > 0);
  }, []);

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Reading Plans</h1>
          <p className="text-muted-foreground">Guided journeys through Scripture</p>
        </div>

        {hasActivePlans && (
          <div className="mb-8">
            <TodaysReadingCard />
          </div>
        )}

        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Available Plans</h2>
        <AllPlans />
      </div>
    </div>
  );
}
