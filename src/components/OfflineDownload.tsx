import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { downloadAllBible, isOfflineDataAvailable, clearOfflineData } from "@/lib/offlineBible";

export function OfflineDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const available = await isOfflineDataAvailable();
    setIsAvailable(available);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    
    try {
      await downloadAllBible((current, total) => {
        setProgress(current);
        setTotal(total);
      });
      
      toast.success("Complete Bible downloaded for offline access!");
      setIsAvailable(true);
    } catch (error) {
      toast.error("Failed to download Bible. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearOfflineData();
      setIsAvailable(false);
      toast.success("Offline data cleared");
    } catch (error) {
      toast.error("Failed to clear offline data");
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Download className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Offline Bible Access</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download the complete KJV Bible (all 66 books) for offline reading. No internet required after download.
          </p>

          {isAvailable && !isDownloading && (
            <div className="flex items-center gap-2 mb-4 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Complete Bible available offline</span>
            </div>
          )}

          {isDownloading && (
            <div className="space-y-2 mb-4">
              <Progress value={(progress / total) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Downloading: {progress} of {total} chapters
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : isAvailable ? "Re-download" : "Download All"}
            </Button>

            {isAvailable && !isDownloading && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Data
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
