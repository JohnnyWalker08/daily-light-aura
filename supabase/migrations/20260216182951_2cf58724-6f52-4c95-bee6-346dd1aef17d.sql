
-- Table to store the entire KJV Bible locally
CREATE TABLE public.bible_chapters (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (book, chapter)
);

-- Index for fast lookups
CREATE INDEX idx_bible_chapters_book_chapter ON public.bible_chapters (book, chapter);

-- Public read access (no auth needed to read the Bible)
ALTER TABLE public.bible_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bible chapters are publicly readable"
  ON public.bible_chapters
  FOR SELECT
  USING (true);

-- Only service role can insert/update (via edge function)
CREATE POLICY "Service role can manage bible chapters"
  ON public.bible_chapters
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
