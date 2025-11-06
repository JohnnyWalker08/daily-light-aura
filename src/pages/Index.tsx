import { VerseOfTheDay } from "@/components/VerseOfTheDay";
import { QuickActions } from "@/components/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8 sacred-pattern">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-6">
            <div className="text-6xl mb-4 animate-float">✝️</div>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black gradient-text mb-6 tracking-tight">
            JOHNNY's BIBLE
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            Experience God's word in divine beauty. Daily inspiration, sacred scriptures, and spiritual transformation.
          </p>
        </div>

        {/* Verse of the Day */}
        <div className="mb-16">
          <VerseOfTheDay />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-8 text-center gradient-text">
            Continue Your Sacred Journey
          </h2>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Index;
