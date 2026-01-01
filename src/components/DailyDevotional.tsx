import { Card } from "@/components/ui/card";
import { Sun, Moon, Sparkles } from "lucide-react";

const MORNING_REFLECTIONS = [
  { title: "Start with Gratitude", text: "Thank God for the gift of a new day. Let your first thoughts be of praise and thanksgiving for His mercies that are new every morning." },
  { title: "Seek His Presence", text: "Before the busyness of the day begins, quiet your heart and invite God into every moment. His presence is your strength." },
  { title: "Surrender Your Plans", text: "Commit your day to the Lord. Trust that He knows what lies ahead and will guide your steps in wisdom and peace." },
  { title: "Embrace His Love", text: "Remember: you are deeply loved. Nothing you face today can separate you from the love of God in Christ Jesus." },
  { title: "Walk in Faith", text: "Let faith, not fear, lead you today. God has not given you a spirit of fear, but of power, love, and a sound mind." },
  { title: "Renewed Strength", text: "Those who wait upon the Lord shall renew their strength. Begin this day by resting in His promises." },
  { title: "His Mercies Are New", text: "Yesterday's struggles are behind you. Today is a fresh start, filled with new mercies from a faithful God." },
  { title: "Light for Your Path", text: "God's Word is a lamp to your feet. Let His truth illuminate every decision you make today." },
];

const EVENING_REFLECTIONS = [
  { title: "Rest in His Peace", text: "As the day ends, release your worries to God. He watches over you while you sleep and will sustain you through the night." },
  { title: "Reflect with Gratitude", text: "Look back on your day and find moments of grace. Thank God for His faithfulness, even in the small things." },
  { title: "Receive Forgiveness", text: "If you've fallen short today, remember God's grace is sufficient. His mercies are new every morning." },
  { title: "Trust for Tomorrow", text: "Don't worry about tomorrow. God who cared for you today will be faithful tomorrow. Rest in that promise." },
  { title: "Peaceful Sleep", text: "In peace you will lie down and sleep, for the Lord alone makes you dwell in safety. Let His peace wash over you." },
  { title: "He Never Sleeps", text: "The Lord who watches over you will not slumber. Sleep peacefully knowing you are protected by His love." },
  { title: "Count Your Blessings", text: "Before you close your eyes, count three blessings from today. A grateful heart rests well." },
  { title: "Surrender Your Cares", text: "Cast all your anxieties on Him because He cares for you. Let go and let God carry what you cannot." },
];

export const DailyDevotional = () => {
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const reflections = isMorning ? MORNING_REFLECTIONS : EVENING_REFLECTIONS;
  
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % reflections.length;
  const reflection = reflections[index];

  return (
    <Card className="glass-card p-6 animate-fade-in-up relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isMorning 
            ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}>
          {isMorning ? (
            <Sun className="h-5 w-5 text-white" />
          ) : (
            <Moon className="h-5 w-5 text-white" />
          )}
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            {isMorning ? "Morning" : "Evening"} Reflection
            <Sparkles className="h-4 w-4 text-accent" />
          </h3>
          <p className="text-sm text-muted-foreground">{reflection.title}</p>
        </div>
      </div>

      <p className="text-foreground/90 leading-relaxed italic">
        "{reflection.text}"
      </p>
    </Card>
  );
};
