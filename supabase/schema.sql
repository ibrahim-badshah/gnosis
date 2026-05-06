-- Supabase schema for Gnosis CS Dictionary
-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- ============================================
-- 1. Dynamic Terms Table (shared AI-generated words)
-- ============================================
CREATE TABLE IF NOT EXISTS public.dynamic_terms (
  id TEXT PRIMARY KEY,
  term_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.dynamic_terms ENABLE ROW LEVEL SECURITY;

-- Anyone can read terms
CREATE POLICY "Allow public read access"
  ON public.dynamic_terms FOR SELECT USING (true);

-- Anyone can insert terms (authenticated or guest)
CREATE POLICY "Allow authenticated insert"
  ON public.dynamic_terms FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow anonymous insert"
  ON public.dynamic_terms FOR INSERT TO anon WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_dynamic_terms_created_at
  ON public.dynamic_terms (created_at DESC);


-- ============================================
-- 2. Feedback Table (user feedback from About page)
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT 'guest',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (guests too)
CREATE POLICY "Allow anyone to insert feedback"
  ON public.feedback FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated to insert feedback"
  ON public.feedback FOR INSERT TO authenticated WITH CHECK (true);

-- Only service role / admin can read all feedback (not exposed to clients)
-- If you want users to see their own feedback, add:
CREATE POLICY "Allow users to read own feedback"
  ON public.feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at
  ON public.feedback (created_at DESC);
