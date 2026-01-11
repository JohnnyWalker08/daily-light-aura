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
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator && (window.navigator as any).standalone);

    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show immediately as a top banner once the browser allows prompting
      if (!sessionStorage.getItem('pwa-prompt-dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS: no beforeinstallprompt event; show a lightweight banner with instructions
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari = isIOS && /safari/.test(ua) && !/crios|fxios/.test(ua);
    if (isSafari && !sessionStorage.getItem('pwa-prompt-dismissed')) {
      setShowPrompt(true);
    }

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

  if (!showPrompt || dismissed) return null;

  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = isIOS && /safari/.test(ua) && !/crios|fxios/.test(ua);
  const canTriggerPrompt = !!deferredPrompt;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-3 pt-3">
      <Card className="glass-card mx-auto max-w-3xl p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold leading-tight">Install DailyLight</p>
            <p className="text-sm text-muted-foreground leading-tight">
              {isSafari && !canTriggerPrompt
                ? "On iPhone: tap Share → Add to Home Screen."
                : "Add to your home screen for offline reading and quick access."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstall}
              disabled={!canTriggerPrompt}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              Install
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDismiss} aria-label="Dismiss install prompt">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
