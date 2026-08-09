# Active Reading: Guided Review & Insight Companion

Turn passive chapter-reading into intentional engagement. After each chapter the reader is invited into a short, guided reflection. The AI never hands over conclusions — it asks, prompts, and only walks step-by-step when the reader says they're stuck.

## The core loop

1. **Read chapter** → tapping "Mark as Read" opens the Review sheet instead of instantly completing.
2. **Reflect (2–3 min, 3 steps)**
   - *Notice*: "What stood out to you in this chapter?"
   - *Understand*: one AI-generated chapter-specific question that pulls out context most people miss.
   - *Apply*: "What is one thing this changes for you today?" + a one-line prayer prompt.
   Every step has a "I'm not sure / help me see it" button.
3. **Guided escalation** (only when asked): the AI responds Socratically — first a nudge question, then context of what came before in the story, then a phrase-by-phrase walkthrough of the key verses. It ends each level by handing thinking back: "What do you make of that?"
4. **Save insight** → chapter marked read + insight stored in the Insight Journal.
5. **Daily recap** on the home page: what you read today, your saved insights, one truth to carry, and a single "carry this into tomorrow" line.

Reviews are always skippable ("Just mark it read") so reading never feels like homework.

## Companion features

**Insight Journal** (`/insights`)
Searchable log of every saved reflection, grouped by day and book, with the verse it came from. Shows a "reflections streak" alongside the existing reading streak, so consistency of *thinking* is rewarded, not just page turns.

**Identity in Christ**
After each review, a truth card drawn from what was just read ("Because of this — you are…"), scripture-anchored, saveable. A rotating set also appears on the home page. Content is generated from the chapter, constrained to KJV text and plain biblical grounding — no speculative doctrine.

**Boldness / Share**
Any saved insight can become a clean, shareable card (verse + your insight, app-styled image/text) with a gentle nudge: "Who needs to hear this today?" Optional, never nagging.

**Weary mode**
A "I'm weary today" entry point on the home page and in the More hub. Ask how they feel (heavy, anxious, guilty, tired, joyful-but-dry), then surface a short comfort passage, a 60-second reflection, and one truth of God's love — no streaks, no pressure, no metrics on that screen.

## UX principles

- Review lives in a bottom sheet on mobile, side panel on desktop; one question visible at a time with a 3-dot progress bar — never a wall of form fields.
- Answers autosave; leaving mid-review resumes where you left.
- AI replies stream in so it feels like a companion thinking with you, not a page loading.
- The app never says "wrong". Escalation is framed as "let's look closer together."
- Whole flow works offline for reading and journaling; AI steps show a calm "reconnect to go deeper" state.

## Technical approach

- **Backend**: one edge function `reflection-coach`, streaming, with modes: `question` (generate the chapter question), `nudge`, `context`, `walkthrough`, `identity`, `weary`, `recap`. Chapter KJV text is pulled from the existing `bible_chapters` table and passed in, so the model reasons over real text rather than memory.
- **Models**: `openai/gpt-5.6-sol` via the gateway Responses API for the guided/Socratic reasoning steps, and Claude via your own key for the pastoral/identity copy. You'll add `ANTHROPIC_API_KEY` as a secret; I'll request it when we build. Both are called server-side only, with a shared system prompt enforcing: KJV only, Socratic (never lecture), scripture-anchored, no denominational speculation.
- **Data**: new tables `reflections` (book, chapter, verse_ref, prompt answers, insight text, created_at) and `identity_cards` (saved truths), both RLS-scoped to `auth.uid()`. Since auth is optional here, unsigned users store to localStorage with the same shape and sync on sign-in.
- **Frontend**: `ReviewSheet` component wired into `Bible.tsx`'s mark-read path, `DailyRecap` on Index, `/insights` route + nav entry, `WearyMode` page, `ShareCard` renderer. Existing glass-card / gradient design language reused throughout.

## Build order

1. Data layer + `reflection-coach` edge function with the Socratic system prompt.
2. Review sheet in the Bible reader (3 steps + escalation).
3. Insight Journal page and reflections streak.
4. Daily recap on home.
5. Identity cards + share cards.
6. Weary mode.
