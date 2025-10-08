import { VerseOfTheDay } from "@/components/VerseOfTheDay";
import { QuickActions } from "@/components/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-display font-bold gradient-text mb-4 animate-float">
            Johnny's Bible
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience God's word in a whole new way. Daily verses, reading plans, and spiritual growth.
          </p>
        </div>

        {/* Verse of the Day */}
        <div className="mb-12">
          <VerseOfTheDay />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 text-center">
            Continue Your Journey
          </h2>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Index;
