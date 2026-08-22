import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

type Mode = "question" | "nudge" | "context" | "walkthrough" | "identity" | "weary" | "recap" | "related";

const BASE_RULES = `You are a warm, Christ-centred reading companion inside a KJV Bible app.
Non-negotiable rules:
- Scripture is the King James Version only. Quote it accurately; never invent verses or references.
- Be Socratic. You draw understanding OUT of the reader. You do not lecture, and you never hand over a tidy conclusion they could have reached themselves.
- Stay plainly biblical. No denominational speculation, no novel doctrine, no politics, no hype.
- Warm, personal, unhurried. Speak like a brother or sister in Christ, not a teacher grading work.
- Never tell the reader they are wrong. If they missed something, invite them to look closer together.
- Short. Mobile screen. Plain text, no markdown headings, no bullet symbols unless asked.`;

function buildPrompt(mode: Mode, payload: Record<string, any>) {
  const { book, chapter, chapterText, answer, question, feeling, todaySummary, verseRef, verseText } = payload;
  const passage = chapterText ? `\n\nPassage (${book} ${chapter}, KJV):\n${chapterText}` : "";

  switch (mode) {
    case "question":
      return `${BASE_RULES}

Task: Write ONE short question about ${book} ${chapter} that makes the reader notice something they would very likely skim past — a detail of context, a contrast, a word choice, or what it cost someone in the text.
The question must be answerable from the passage itself by an ordinary reader thinking carefully. Do not give any answer or hint.
Output only the question, under 30 words.${passage}`;

    case "nudge":
      return `${BASE_RULES}

The reader said they are not sure how to answer this question: "${question}"
Task: Give ONE gentle nudge — point them to where to look (a verse number, a phrase, a comparison) and end with a question handing the thinking back to them.
Do not answer the question for them. Under 60 words.${passage}`;

    case "context":
      return `${BASE_RULES}

The reader is still stuck on: "${question}"
Task: Give them the background they are missing — what came just before this in the story, who these people are, what a phrase would have meant to the first hearers. Keep it to the facts of Scripture.
Then end with: a single question asking what they now make of it. Under 110 words.${passage}`;

    case "walkthrough":
      return `${BASE_RULES}

The reader still cannot see it. Question: "${question}"
Task: Walk them through the key verses phrase by phrase — quote a short phrase (KJV), say plainly what it is saying, then move to the next. Three or four phrases at most.
Close with one question: what does this stir in them, or what would change if it were true of them today. Under 160 words.${passage}`;

    case "identity":
      return `${BASE_RULES}

The reader just read ${book} ${chapter} and reflected: "${answer || "(no reflection written)"}"
Task: Write one short truth card about who they are in Christ, grounded in what this chapter reveals about God.
Format exactly:
Line 1: a truth beginning with "You are" or "You have" or "Because of this" (max 18 words).
Line 2: the KJV verse reference it rests on, then the quoted verse.
Nothing else. No preamble.${passage}`;

    case "weary":
      return `${BASE_RULES}

The reader came to the app today feeling: ${feeling}.
Task: Meet them where they are. Give:
1. One sentence naming what they may be carrying, without diagnosing them.
2. One KJV passage (reference then the verse text) that speaks directly to it.
3. One short reflection question to sit with.
4. One line of God's steady love toward them right now.
No striving, no tasks, no guilt, no mention of streaks or progress. Under 130 words.`;

    case "related":
      return `${BASE_RULES}

The reader is searching Scripture and is looking at this verse:
${verseRef} — "${verseText}"

Task: Show them where this thread runs through the rest of the Bible. Give exactly three related passages:
For each: the KJV reference, then the verse (or the key clause) quoted accurately, then one short line on how it connects to the verse above.
Then one closing question inviting them to see the thread for themselves.
No markdown headings. Under 160 words.`;

    case "recap":
      return `${BASE_RULES}

Here is what the reader read and wrote today:
${todaySummary}

Task: Write a short recap that helps it settle:
1. One sentence on the thread running through today's reading.
2. One truth to carry (start with "Carry this:").
3. One short question for tomorrow.
Speak to them as "you". Under 110 words.`;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const mode = body?.mode as Mode;
    const validModes: Mode[] = ["question", "nudge", "context", "walkthrough", "identity", "weary", "recap", "related"];
    if (!mode || !validModes.includes(mode)) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Keep passage payload within a sane size.
    if (typeof body.chapterText === "string" && body.chapterText.length > 24000) {
      body.chapterText = body.chapterText.slice(0, 24000);
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        input: buildPrompt(mode, body),
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error("AI gateway error", upstream.status, detail);
      const message =
        upstream.status === 429
          ? "Too many requests right now — please try again in a moment."
          : upstream.status === 402
          ? "AI credits are exhausted. Please add credits to continue."
          : "The companion could not respond right now.";
      return new Response(JSON.stringify({ error: message }), {
        status: upstream.status === 429 || upstream.status === 402 ? upstream.status : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert the SSE response into a plain text stream of answer deltas.
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const evt = JSON.parse(data);
                if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
                  controller.enqueue(encoder.encode(evt.delta));
                }
              } catch {
                // ignore partial/unknown events
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error("stream error", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("reflection-coach failure", error);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
