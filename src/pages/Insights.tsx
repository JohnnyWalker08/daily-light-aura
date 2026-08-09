import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { BookOpen, Flame, Search, Share2, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getReflections,
  deleteReflection,
  getReflectionStreak,
  getIdentityCards,
  deleteIdentityCard,
  Reflection,
  IdentityCard,
} from "@/lib/reflectionStorage";

export default function Insights() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [cards, setCards] = useState<IdentityCard[]>([]);
  const [streak, setStreak] = useState(0);
  const [query, setQuery] = useState("");

  const refresh = () => {
    setReflections(getReflections());
    setCards(getIdentityCards());
    setStreak(getReflectionStreak());
  };

  useEffect(refresh, []);

  const filtered = reflections.filter((r) =>
    `${r.book} ${r.chapter} ${r.noticed} ${r.understood} ${r.applied}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Reflection[]>>((acc, r) => {
    const day = new Date(r.createdAt).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    (acc[day] ||= []).push(r);
    return acc;
  }, {});

  const share = async (r: Reflection) => {
    const text = `${r.book} ${r.chapter}\n\n"${r.applied || r.noticed}"\n\nWho needs to hear this today?`;
    try {
      if (navigator.share) await navigator.share({ title: `${r.book} ${r.chapter}`, text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Insight copied — go share it");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error("Could not share");
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Insight Journal</h1>
          <p className="text-muted-foreground">Everything the Word has been showing you.</p>
        </div>

        <Card className="glass-card p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Flame className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold">{streak} day{streak === 1 ? "" : "s"}</p>
            <p className="text-sm text-muted-foreground">Reflection streak — thinking, not just turning pages</p>
          </div>
        </Card>

        {cards.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Who you are in Christ
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {cards.slice(0, 6).map((c) => (
                <Card key={c.id} className="glass-card p-4 group relative">
                  <p className="font-display leading-snug mb-2">{c.text}</p>
                  <p className="text-xs text-muted-foreground">{c.reference}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      deleteIdentityCard(c.id);
                      refresh();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search your insights..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {reflections.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h3 className="font-display font-semibold mb-2">Nothing here yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Read a chapter and take the short review — your first insight lands here.
            </p>
            <Link to="/bible">
              <Button className="bg-gradient-to-r from-primary to-primary-glow">Open the Bible</Button>
            </Link>
          </Card>
        ) : (
          Object.entries(grouped).map(([day, items]) => (
            <div key={day} className="mb-8">
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">{day}</h2>
              <div className="space-y-3">
                {items.map((r) => (
                  <Card key={r.id} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Link
                        to={`/bible?book=${encodeURIComponent(r.book)}&chapter=${r.chapter}`}
                        className="font-display font-semibold text-primary"
                      >
                        {r.book} {r.chapter}
                      </Link>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => share(r)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            deleteReflection(r.id);
                            refresh();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      {r.noticed && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Noticed</p>
                          <p>{r.noticed}</p>
                        </div>
                      )}
                      {r.question && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">{r.question}</p>
                          <p>{r.understood}</p>
                        </div>
                      )}
                      {r.applied && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Applying</p>
                          <p>{r.applied}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
