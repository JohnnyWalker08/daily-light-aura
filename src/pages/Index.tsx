import { VerseOfTheDay } from "@/components/VerseOfTheDay";
import { QuickActions } from "@/components/QuickActions";
import { OfflineDownload } from "@/components/OfflineDownload";
import { ReadingProgressCard } from "@/components/ReadingProgress";
import { TodaysReadingCard } from "@/components/ReadingPlans";
import { DailyDevotional } from "@/components/DailyDevotional";
import { DidYouKnow } from "@/components/DidYouKnow";
import { getActivePlans } from "@/lib/plansStorage";
import { useState, useEffect } from "react";

const Index = () => {
  const [hasActivePlans, setHasActivePlans] = useState(false);

  useEffect(() => {
    setHasActivePlans(getActivePlans().length > 0);
  }, []);

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      {/* Did You Know Popup - shows once per session on app open */}
      <DidYouKnow />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-display font-bold gradient-text mb-4 animate-float">
            DAILY LIGHT's BIBLE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience God's word in a whole new way. Daily verses, reading plans, and spiritual growth.
          </p>
        </div>

        <div className="mb-12"><VerseOfTheDay /></div>

        {/* Daily Devotional Widget */}
        <div className="mb-12">
          <DailyDevotional />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <ReadingProgressCard />
          {hasActivePlans && <TodaysReadingCard />}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 text-center">Continue Your Journey</h2>
          <QuickActions />
        </div>

        <div className="mb-12"><OfflineDownload /></div>
      </div>
    </div>
  );
};

export default Index;
