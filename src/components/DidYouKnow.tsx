import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

// Facts that foster trust in the Bible, evidence supporting biblical events, words of wisdom
const DID_YOU_KNOW_FACTS = [
  {
    category: "Archaeological Evidence",
    title: "The Dead Sea Scrolls",
    content: "Discovered in 1947, the Dead Sea Scrolls contain the oldest known copies of the Hebrew Bible, dating back to 150 BCE. They prove the Bible has been accurately preserved for over 2,000 years with remarkable consistency.",
  },
  {
    category: "Historical Confirmation",
    title: "King David's Existence",
    content: "The Tel Dan Stele, discovered in 1993, is an ancient stone slab that mentions the 'House of David' — providing the first historical evidence outside the Bible of King David's dynasty.",
  },
  {
    category: "Fulfilled Prophecy",
    title: "Cyrus the Great",
    content: "Isaiah 44-45 named Cyrus as the one who would free Israel from captivity — written 150 years before Cyrus was born. In 539 BCE, Cyrus conquered Babylon and freed the Jewish exiles, exactly as prophesied.",
  },
  {
    category: "Scientific Insight",
    title: "The Earth in Space",
    content: "Job 26:7 states God 'hangs the earth on nothing' — describing our planet floating in space. This was written around 2000 BCE, millennia before science confirmed Earth floats in the vacuum of space.",
  },
  {
    category: "Archaeological Evidence",
    title: "The Pool of Siloam",
    content: "In 2004, archaeologists discovered the Pool of Siloam in Jerusalem, where Jesus healed a blind man (John 9). The pool dates to the time of Christ, confirming the Gospel account.",
  },
  {
    category: "Words of Wisdom",
    title: "The Power of Words",
    content: "Proverbs 18:21 says, 'Death and life are in the power of the tongue.' Modern psychology confirms that positive or negative speech profoundly affects mental health, relationships, and even physical well-being.",
  },
  {
    category: "Historical Confirmation",
    title: "Pontius Pilate",
    content: "In 1961, archaeologists found the 'Pilate Stone' in Caesarea, inscribed with Pontius Pilate's name and title — confirming the historical existence of the Roman governor who sentenced Jesus.",
  },
  {
    category: "Scientific Insight",
    title: "Blood and Life",
    content: "Leviticus 17:11 states 'the life of the flesh is in the blood.' This was revealed 3,000+ years ago. Modern medicine confirms blood carries oxygen, nutrients, and is essential for life.",
  },
  {
    category: "Words of Wisdom",
    title: "A Cheerful Heart",
    content: "Proverbs 17:22 says, 'A cheerful heart is good medicine.' Research shows that laughter and positive emotions boost the immune system, reduce stress hormones, and improve cardiovascular health.",
  },
  {
    category: "Archaeological Evidence",
    title: "Sodom and Gomorrah",
    content: "Recent studies at Tall el-Hammam in Jordan found evidence of a massive cosmic airburst around 1650 BCE that destroyed the city — consistent with the biblical account of fire from heaven.",
  },
  {
    category: "Fulfilled Prophecy",
    title: "The Destruction of Tyre",
    content: "Ezekiel 26 prophesied that Tyre would be destroyed, its stones thrown into the sea. Alexander the Great fulfilled this in 332 BCE, using the ruins of mainland Tyre to build a causeway to the island city.",
  },
  {
    category: "Words of Wisdom",
    title: "Generosity and Blessing",
    content: "Proverbs 11:25 says, 'A generous person will prosper.' Modern research confirms that giving activates reward centers in the brain, reduces stress, and is associated with longer, healthier lives.",
  },
  {
    category: "Historical Confirmation",
    title: "The Hittite Civilization",
    content: "For centuries, critics doubted the Hittites existed since they were only mentioned in the Bible. In 1906, archaeologists discovered the Hittite capital, confirming this powerful empire.",
  },
  {
    category: "Scientific Insight",
    title: "Ocean Currents",
    content: "Psalm 8:8 mentions 'paths of the seas.' Matthew Maury, the father of oceanography, was inspired by this verse to map the ocean currents in the 1800s, revolutionizing sea navigation.",
  },
  {
    category: "Words of Wisdom",
    title: "The Value of Rest",
    content: "God instituted the Sabbath rest in Genesis 2:3. Science confirms that regular rest improves memory, creativity, immune function, and longevity — our bodies are designed to need rest.",
  },
  {
    category: "Archaeological Evidence",
    title: "The Walls of Jericho",
    content: "Excavations at Jericho found walls that fell outward (unusual in sieges) and evidence of fire — matching Joshua's account. Pottery and grain stores date the destruction to around 1400 BCE.",
  },
  {
    category: "Fulfilled Prophecy",
    title: "Israel Restored",
    content: "Ezekiel 37 prophesied that Israel would be restored as a nation. After 1,900 years of exile, Israel was reestablished in 1948 — the only ancient nation to be dispersed and then restored.",
  },
  {
    category: "Words of Wisdom",
    title: "The Tongue's Power",
    content: "James 3:5 compares the tongue to a small spark that sets a forest ablaze. Neuroscience shows our words literally rewire our brains and profoundly influence those who hear them.",
  },
];

export function DidYouKnow() {
  const [isOpen, setIsOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Check if already shown in this session
    const hasBeenShown = sessionStorage.getItem("did-you-know-shown");
    if (!hasBeenShown) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("did-you-know-shown", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Pick a random fact on mount
    const randomIndex = Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length);
    setFactIndex(randomIndex);
  }, []);

  const fact = DID_YOU_KNOW_FACTS[factIndex];

  const nextFact = () => {
    setFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length);
  };

  const prevFact = () => {
    setFactIndex((prev) => (prev - 1 + DID_YOU_KNOW_FACTS.length) % DID_YOU_KNOW_FACTS.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="glass-card w-full max-w-md p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Did You Know?</h2>
              <p className="text-xs text-muted-foreground">{fact.category}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {fact.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{fact.content}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prevFact}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {factIndex + 1} of {DID_YOU_KNOW_FACTS.length}
          </span>
          <Button variant="ghost" size="sm" onClick={nextFact}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Close Button */}
        <Button
          onClick={() => setIsOpen(false)}
          className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow"
        >
          Start Reading
        </Button>
      </Card>
    </div>
  );
}
