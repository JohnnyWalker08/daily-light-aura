import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const hasBeenDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (hasBeenDismissed) {
      setDismissed(true);
      return;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 8 seconds
      setTimeout(() => {
        if (!sessionStorage.getItem('pwa-prompt-dismissed')) {
          setShowPrompt(true);
        }
      }, 8000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="glass-card w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
            <Download className="h-7 w-7 text-primary-foreground" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold mb-1">Install DailyLight</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add to your home screen for quick access, offline reading, and a better experience.
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
              >
                Install App
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDismiss}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
