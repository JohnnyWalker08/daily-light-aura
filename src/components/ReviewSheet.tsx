import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Sparkles, Loader2, ArrowRight, HelpCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { streamCoach, versesToText } from "@/lib/reflectionCoach";
import {
  saveReflection,
  saveIdentityCard,
  saveDraft,
  getDraft,
  clearDraft,
} from "@/lib/reflectionStorage";

interface ReviewSheetProps {
  book: string;
  chapter: number;
  verses: any;
  onClose: () => void;
  /** Called when the reader finishes or skips — marks the chapter read. */
  onComplete: () => void;
}

const STEPS = ["Notice", "Understand", "Apply"];
const HELP_LEVELS = ["nudge", "context", "walkthrough"] as const;

export function ReviewSheet({ book, chapter, verses, onClose, onComplete }: ReviewSheetProps) {
  const draft = useRef(getDraft(book, chapter));
  const [step, setStep] = useState(draft.current?.step ?? 0);
  const [noticed, setNoticed] = useState(draft.current?.noticed ?? "");
  const [understood, setUnderstood] = useState(draft.current?.understood ?? "");
  const [applied, setApplied] = useState(draft.current?.applied ?? "");
  const [question, setQuestion] = useState(draft.current?.question ?? "");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [help, setHelp] = useState("");
  const [helpLevel, setHelpLevel] = useState(0);
  const [helpLoading, setHelpLoading] = useState(false);
  const [identity, setIdentity] = useState("");
  const [saving, setSaving] = useState(false);
  const [offlineNote, setOfflineNote] = useState("");

  const chapterText = versesToText(verses);

  // Autosave the draft so leaving mid-review resumes where you left.
  useEffect(() => {
    saveDraft({ book, chapter, step, noticed, question, understood, applied });
  }, [book, chapter, step, noticed, question, understood, applied]);

  // Generate the chapter-specific question when the reader reaches step 2.
  useEffect(() => {
    if (step !== 1 || question || loadingQuestion) return;
    let cancelled = false;
    setLoadingQuestion(true);
    setOfflineNote("");
    streamCoach("question", { book, chapter, chapterText }, (full) => {
      if (!cancelled) setQuestion(full);
    })
      .catch((error: Error) => {
        if (!cancelled) setOfflineNote(error.message);
      })
      .finally(() => !cancelled && setLoadingQuestion(false));
    return () => {
      cancelled = true;
    };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const askForHelp = async () => {
    const mode = HELP_LEVELS[Math.min(helpLevel, HELP_LEVELS.length - 1)];
    setHelpLoading(true);
    setHelp("");
    try {
      await streamCoach(
        mode,
        {
          book,
          chapter,
          chapterText,
          question: question || `What stands out in ${book} ${chapter}?`,
        },
        setHelp
      );
      setHelpLevel((l) => Math.min(l + 1, HELP_LEVELS.length));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setHelpLoading(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    saveReflection({ book, chapter, noticed, question, understood, applied });
    clearDraft();

    // Truth card from what was just read — best effort, never blocks saving.
    try {
      let text = "";
      await streamCoach(
        "identity",
        { book, chapter, chapterText, answer: [noticed, understood, applied].filter(Boolean).join(" — ") },
        (full) => {
          text = full;
          setIdentity(full);
        }
      );
      const [line, ...rest] = text.trim().split("\n").filter(Boolean);
      if (line) {
        saveIdentityCard({ text: line, reference: rest.join(" ").trim(), book, chapter });
      }
      setStep(3);
    } catch {
      onComplete();
      toast.success("Insight saved to your journal");
      onClose();
      return;
    } finally {
      setSaving(false);
    }
    onComplete();
  };

  const canAdvance =
    (step === 0 && noticed.trim().length > 0) ||
    (step === 1 && understood.trim().length > 0) ||
    (step === 2 && applied.trim().length > 0);

  const skip = () => {
    clearDraft();
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <Card className="glass-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest font-semibold">Active Reading</span>
            </div>
            <h3 className="text-xl font-display font-bold">
              {book} {chapter}
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close review">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {step < 3 && (
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    i <= step ? "bg-gradient-to-r from-primary to-primary-glow" : "bg-muted"
                  }`}
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">{label}</span>
              </div>
            ))}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-lg font-display">What stood out to you in this chapter?</p>
            <p className="text-sm text-muted-foreground">
              A word, a moment, something that surprised or unsettled you. No wrong answers.
            </p>
            <Textarea
              autoFocus
              value={noticed}
              onChange={(e) => setNoticed(e.target.value)}
              placeholder="What caught your attention..."
              className="min-h-28"
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {loadingQuestion && !question ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking closely at the chapter...
              </div>
            ) : question ? (
              <p className="text-lg font-display">{question}</p>
            ) : (
              <p className="text-lg font-display">
                What is easy to miss in this chapter if you read it quickly?
              </p>
            )}
            {offlineNote && (
              <p className="text-xs text-muted-foreground">
                Reconnect to go deeper — reflecting offline still counts.
              </p>
            )}
            <Textarea
              value={understood}
              onChange={(e) => setUnderstood(e.target.value)}
              placeholder="Think it through in your own words..."
              className="min-h-28"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-lg font-display">What is one thing this changes for you today?</p>
            <p className="text-sm text-muted-foreground">
              Then turn it into one line of prayer — even a sentence is enough.
            </p>
            <Textarea
              value={applied}
              onChange={(e) => setApplied(e.target.value)}
              placeholder="Today, this means..."
              className="min-h-28"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Check className="h-6 w-6 text-primary-foreground" />
            </div>
            <h4 className="font-display text-lg">Saved to your journal</h4>
            {identity && (
              <Card className="glass-card p-4 text-left whitespace-pre-line text-sm leading-relaxed">
                {identity}
              </Card>
            )}
            <Button
              className="w-full bg-gradient-to-r from-primary to-primary-glow"
              onClick={() => {
                onClose();
              }}
            >
              Amen
            </Button>
          </div>
        )}

        {step < 3 && (
          <>
            {help && (
              <Card className="glass-card p-4 mt-4 text-sm leading-relaxed whitespace-pre-line border-primary/30">
                {help}
              </Card>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground"
                onClick={askForHelp}
                disabled={helpLoading}
              >
                {helpLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <HelpCircle className="h-4 w-4 mr-2" />
                )}
                {helpLevel === 0
                  ? "I'm not sure — help me see it"
                  : helpLevel === 1
                  ? "Show me the background"
                  : helpLevel === 2
                  ? "Walk me through it phrase by phrase"
                  : "Look again together"}
              </Button>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={skip} className="text-muted-foreground">
                  Just mark it read
                </Button>
                <div className="flex-1" />
                {step < 2 ? (
                  <Button
                    onClick={() => {
                      setStep(step + 1);
                      setHelp("");
                    }}
                    disabled={!canAdvance}
                    className="bg-gradient-to-r from-primary to-primary-glow"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={finish}
                    disabled={!canAdvance || saving}
                    className="bg-gradient-to-r from-primary to-primary-glow"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save insight
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
