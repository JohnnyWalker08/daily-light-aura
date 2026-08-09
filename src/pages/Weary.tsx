import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, HeartHandshake } from "lucide-react";
import { streamCoach } from "@/lib/reflectionCoach";
import { toast } from "sonner";

const FEELINGS = [
  { key: "heavy", label: "Heavy" },
  { key: "anxious", label: "Anxious" },
  { key: "guilty", label: "Guilty" },
  { key: "tired", label: "Tired" },
  { key: "joyful but dry", label: "Joyful but dry" },
];

export default function Weary() {
  const [feeling, setFeeling] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const choose = async (key: string) => {
    setFeeling(key);
    setText("");
    setLoading(true);
    try {
      await streamCoach("weary", { feeling: key }, setText);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
            <HeartHandshake className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">Come and rest</h1>
          <p className="text-muted-foreground">
            No streaks here. No catching up. Just you and the One who loves you.
          </p>
        </div>

        <Card className="glass-card p-6">
          <p className="font-display mb-4">How are you today?</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {FEELINGS.map((f) => (
              <Button
                key={f.key}
                variant={feeling === f.key ? "default" : "outline"}
                size="sm"
                className={feeling === f.key ? "bg-gradient-to-r from-primary to-primary-glow" : ""}
                onClick={() => choose(f.key)}
                disabled={loading}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {loading && !text && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sitting with you...
            </div>
          )}

          {text && (
            <div className="whitespace-pre-line leading-relaxed text-[15px]">{text}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
