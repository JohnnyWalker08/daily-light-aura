import { Card } from "@/components/ui/card";
import { Sun, Moon, Sparkles } from "lucide-react";

// Extended collection of morning reflections - 40 unique entries
const MORNING_REFLECTIONS = [
  { title: "Start with Gratitude", text: "Thank God for the gift of a new day. Let your first thoughts be of praise and thanksgiving for His mercies that are new every morning." },
  { title: "Seek His Presence", text: "Before the busyness of the day begins, quiet your heart and invite God into every moment. His presence is your strength." },
  { title: "Surrender Your Plans", text: "Commit your day to the Lord. Trust that He knows what lies ahead and will guide your steps in wisdom and peace." },
  { title: "Embrace His Love", text: "Remember: you are deeply loved. Nothing you face today can separate you from the love of God in Christ Jesus." },
  { title: "Walk in Faith", text: "Let faith, not fear, lead you today. God has not given you a spirit of fear, but of power, love, and a sound mind." },
  { title: "Renewed Strength", text: "Those who wait upon the Lord shall renew their strength. Begin this day by resting in His promises." },
  { title: "His Mercies Are New", text: "Yesterday's struggles are behind you. Today is a fresh start, filled with new mercies from a faithful God." },
  { title: "Light for Your Path", text: "God's Word is a lamp to your feet. Let His truth illuminate every decision you make today." },
  { title: "Joy in His Presence", text: "In God's presence there is fullness of joy. Seek Him first, and let His joy be your strength throughout this day." },
  { title: "Armor of God", text: "Put on the full armor of God today. Stand firm in truth, righteousness, and faith against every challenge you face." },
  { title: "His Plans for You", text: "God has plans to prosper you, not to harm you. Trust that He is working all things together for your good." },
  { title: "Be Still and Know", text: "Before you rush into the day, be still. Know that He is God. Let His peace settle in your heart." },
  { title: "Walk in Love", text: "Today, let love be your guide in every interaction. Love is patient, kind, and keeps no record of wrongs." },
  { title: "Courage for Today", text: "Be strong and courageous! Do not be afraid or discouraged, for the Lord your God is with you wherever you go." },
  { title: "Wisdom from Above", text: "If you lack wisdom, ask God, who gives generously to all without finding fault. He will guide your decisions today." },
  { title: "Run with Endurance", text: "Lay aside every weight and run with endurance the race set before you today, fixing your eyes on Jesus." },
  { title: "Abide in Him", text: "As a branch cannot bear fruit by itself, abide in Christ today. Stay connected to the True Vine in all you do." },
  { title: "New Creation", text: "You are a new creation in Christ! The old has passed away. Walk in the newness of life today." },
  { title: "Spirit-Led Living", text: "Walk by the Spirit today, and you will not gratify the desires of the flesh. Let Him lead your steps." },
  { title: "Chosen and Loved", text: "You are chosen, royal, and deeply loved by God. Let this identity shape how you see yourself today." },
  { title: "Grace Upon Grace", text: "From His fullness, we receive grace upon grace. Receive His abundant grace for every moment today." },
  { title: "Delight in the Lord", text: "Delight yourself in the Lord today, and He will give you the desires of your heart aligned with His will." },
  { title: "Living Hope", text: "You have been given a living hope through the resurrection of Jesus Christ. Let hope anchor your soul today." },
  { title: "His Faithful Love", text: "The steadfast love of the Lord never ceases. His mercies are new this morning. Great is His faithfulness!" },
  { title: "Mind on Christ", text: "Set your mind on things above today. Think on what is true, noble, right, pure, lovely, and praiseworthy." },
  { title: "Vessels of Honor", text: "You are a vessel for honorable use, set apart, useful to the Master, prepared for every good work today." },
  { title: "Fountain of Life", text: "With God is the fountain of life; in His light, we see light. Drink deeply from His presence this morning." },
  { title: "Heart of Worship", text: "Enter His gates with thanksgiving and His courts with praise. Begin your day with a heart of worship." },
  { title: "Heavenly Perspective", text: "Seek the things that are above, where Christ is seated. Let eternal perspective guide your earthly steps today." },
];

// Extended collection of evening reflections - 40 unique entries  
const EVENING_REFLECTIONS = [
  { title: "Rest in His Peace", text: "As the day ends, release your worries to God. He watches over you while you sleep and will sustain you through the night." },
  { title: "Reflect with Gratitude", text: "Look back on your day and find moments of grace. Thank God for His faithfulness, even in the small things." },
  { title: "Receive Forgiveness", text: "If you've fallen short today, remember God's grace is sufficient. His mercies are new every morning." },
  { title: "Trust for Tomorrow", text: "Don't worry about tomorrow. God who cared for you today will be faithful tomorrow. Rest in that promise." },
  { title: "Peaceful Sleep", text: "In peace you will lie down and sleep, for the Lord alone makes you dwell in safety. Let His peace wash over you." },
  { title: "He Never Sleeps", text: "The Lord who watches over you will not slumber. Sleep peacefully knowing you are protected by His love." },
  { title: "Count Your Blessings", text: "Before you close your eyes, count three blessings from today. A grateful heart rests well." },
  { title: "Surrender Your Cares", text: "Cast all your anxieties on Him because He cares for you. Let go and let God carry what you cannot." },
  { title: "Everlasting Arms", text: "Underneath are the everlasting arms. Rest tonight in the arms of a Father who holds you close." },
  { title: "Night Watch", text: "On my bed I remember You; I think of You through the watches of the night. Let Him be your last thought." },
  { title: "Dwelling in Safety", text: "You who dwell in the shelter of the Most High will rest in the shadow of the Almighty. You are protected." },
  { title: "Evening Sacrifice", text: "Let my prayer be set before You as incense, the lifting up of my hands as the evening sacrifice." },
  { title: "Songs in the Night", text: "The Lord commands His lovingkindness in the daytime, and in the night His song is with me." },
  { title: "Perfect Peace", text: "You will keep in perfect peace those whose minds are steadfast, because they trust in You. Rest in this peace." },
  { title: "Under His Wings", text: "He will cover you with His feathers, and under His wings you will find refuge. Sleep in His protection." },
  { title: "Heart at Rest", text: "Return to your rest, my soul, for the Lord has been good to you. Your heart can be at peace tonight." },
  { title: "Evening Grace", text: "Where sin increased, grace increased all the more. End this day covered by abundant grace." },
  { title: "Tomorrow's Worries", text: "Each day has enough trouble of its own. Leave tomorrow's worries for tomorrow. Tonight, just rest." },
  { title: "Nighttime Prayers", text: "The Lord hears when you call to Him. Pour out your heart in the stillness of the night." },
  { title: "Guardian of Your Soul", text: "The Lord will watch over your coming and going both now and forevermore. He guards your very soul." },
  { title: "Quiet Waters", text: "He leads me beside quiet waters, He restores my soul. Let Him restore you as you rest tonight." },
  { title: "His Presence Remains", text: "If I settle on the far side of the sea, even there Your hand will guide me. He is with you always." },
  { title: "Satisfied in Him", text: "I will be fully satisfied as with the richest of foods; with singing lips my mouth will praise You." },
  { title: "Darkness into Light", text: "Even the darkness is not dark to Him; the night will shine like the day. Rest in His light." },
  { title: "Faithful Provider", text: "He has not forgotten any of your needs today. The same God will provide for you tomorrow. Rest easy." },
  { title: "Finished Work", text: "It is finished. Whatever you couldn't complete today, trust Jesus who has completed everything for you." },
  { title: "Angels Watching", text: "He will command His angels concerning you to guard you in all your ways. You are divinely protected tonight." },
  { title: "Eternal Home", text: "This world is not your home. Tonight, remember the eternal dwelling place being prepared for you." },
  { title: "Love Remains", text: "Nothing in all creation can separate you from God's love. Carry this truth into your dreams tonight." },
  { title: "Strength in Weakness", text: "His power is made perfect in weakness. Whatever you couldn't do today in your strength, He will do in His." },
];

export const DailyDevotional = () => {
  const now = new Date();
  const hour = now.getHours();
  const isMorning = hour >= 5 && hour < 12;
  const reflections = isMorning ? MORNING_REFLECTIONS : EVENING_REFLECTIONS;
  
  // Calculate day of year with year offset for variety
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const yearOffset = now.getFullYear() % 10;
  const index = (dayOfYear + yearOffset) % reflections.length;
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
