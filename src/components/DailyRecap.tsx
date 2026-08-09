import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { getTodaysReflections, Reflection } from "@/lib/reflectionStorage";
import { streamCoach } from "@/lib/reflectionCoach";

export function DailyRecap() {
  const [items, setItems] = useState<Reflection[]>([]);
  const [recap, setRecap] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(getTodaysReflections());
  }, []);

  if (items.length === 0) return null;

  const buildRecap = async () => {
    setLoading(true);
    setRecap("");
    const summary = items
      .map(
        (r) =>
          `${r.book} ${r.chapter}: noticed "${r.noticed}"; reflected "${r.understood}"; applying "${r.applied}"`
      )
      .join("\n");
    try {
      await streamCoach("recap", { todaySummary: summary }, setRecap);
    } catch (error) {
      setRecap("Reconnect to bring today's reading together — your insights are safely saved.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center gap-2 text-primary mb-3">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest font-semibold">Today's recap</span>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((r) => (
          <div key={r.id} className="text-sm">
            <span className="font-display font-semibold text-foreground">
              {r.book} {r.chapter}
            </span>
            <span className="text-muted-foreground"> — {r.applied || r.noticed}</span>
          </div>
        ))}
      </div>

      {recap ? (
        <p className="whitespace-pre-line text-[15px] leading-relaxed mb-4">{recap}</p>
      ) : null}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={buildRecap}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-primary-glow"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {recap ? "Refresh recap" : "Bring today together"}
        </Button>
        <Link to="/insights">
          <Button size="sm" variant="outline">
            Insight Journal
          </Button>
        </Link>
      </div>
    </Card>
  );
}
