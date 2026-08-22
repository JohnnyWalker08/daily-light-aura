// Client for the reflection-coach edge function (streaming plain text).

export type CoachMode =
  | "question"
  | "nudge"
  | "context"
  | "walkthrough"
  | "identity"
  | "weary"
  | "recap"
  | "related";

export interface CoachPayload {
  book?: string;
  chapter?: number;
  chapterText?: string;
  question?: string;
  answer?: string;
  feeling?: string;
  todaySummary?: string;
  verseRef?: string;
  verseText?: string;
}

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reflection-coach`;

export async function streamCoach(
  mode: CoachMode,
  payload: CoachPayload,
  onDelta: (full: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ mode, ...payload }),
    signal,
  });

  if (!response.ok || !response.body) {
    let message = "The companion is unavailable right now.";
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onDelta(full);
  }

  return full.trim();
}

/** Turn a loaded chapter object into plain KJV text for the model. */
export function versesToText(verses: any): string {
  if (!verses?.verses) return "";
  return verses.verses.map((v: any) => `${v.verse} ${String(v.text).trim()}`).join("\n");
}
