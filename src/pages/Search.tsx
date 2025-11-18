import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Bookmark } from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  reference: string;
  text: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`https://bible-api.com/${query}?translation=kjv`);
      const data = await response.json();
      
      if (data.verses) {
        setResults(data.verses.map((v: any) => ({
          reference: `${data.reference.split(':')[0]}:${v.verse}`,
          text: v.text,
        })));
      } else {
        toast.error("No results found. Try 'love', 'faith', or a reference like 'John 3:16'");
      }
    } catch (error) {
      toast.error("Search failed. Try a verse reference like 'John 3:16'");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (result: SearchResult) => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    bookmarks.push(result);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    toast.success("Added to bookmarks!");
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Search the Bible
          </h1>
          <p className="text-muted-foreground">
            Find verses by keyword or reference
          </p>
        </div>

        <Card className="glass-card p-6 mb-8">
          <div className="flex gap-3">
            <Input
              placeholder="Try 'love', 'faith', or 'John 3:16'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="text-lg"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              <SearchIcon className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card p-6 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card
                key={index}
                className="glass-card p-6 hover:shadow-lg transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-primary mb-2">
                      {result.reference}
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {result.text}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBookmark(result)}
                  >
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {results.length === 0 && !loading && (
          <Card className="glass-card p-12 text-center">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Search for verses by keyword or reference
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Examples: "faith", "love", "John 3:16", "Psalm 23"
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
