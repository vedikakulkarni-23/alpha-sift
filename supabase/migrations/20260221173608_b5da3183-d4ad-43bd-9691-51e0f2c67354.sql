
-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  description TEXT,
  sector TEXT,
  stage TEXT,
  location TEXT,
  founded INTEGER,
  employees TEXT,
  funding TEXT,
  logo TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);

-- Company notes
CREATE TABLE public.company_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write notes" ON public.company_notes FOR ALL USING (true) WITH CHECK (true);

-- Company lists
CREATE TABLE public.company_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write lists" ON public.company_lists FOR ALL USING (true) WITH CHECK (true);

-- Company list items (join table)
CREATE TABLE public.company_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.company_lists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(list_id, company_id)
);

ALTER TABLE public.company_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write list items" ON public.company_list_items FOR ALL USING (true) WITH CHECK (true);

-- Saved searches
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  query TEXT DEFAULT '',
  filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write saved searches" ON public.saved_searches FOR ALL USING (true) WITH CHECK (true);
