-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create enum for newspaper processing status
CREATE TYPE public.newspaper_status AS ENUM ('uploaded', 'processing', 'completed', 'failed');

-- Create newspapers table
CREATE TABLE public.newspapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  upload_date DATE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  status public.newspaper_status DEFAULT 'uploaded',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, upload_date)
);

-- Enable RLS on newspapers
ALTER TABLE public.newspapers ENABLE ROW LEVEL SECURITY;

-- Newspapers policies
CREATE POLICY "Users can view own newspapers"
  ON public.newspapers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own newspapers"
  ON public.newspapers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own newspapers"
  ON public.newspapers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own newspapers"
  ON public.newspapers FOR DELETE
  USING (auth.uid() = user_id);

-- Create GS paper enum
CREATE TYPE public.gs_paper AS ENUM ('GS1', 'GS2', 'GS3', 'GS4');

-- Create articles table (will be populated by AI analysis later)
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  newspaper_id UUID NOT NULL REFERENCES public.newspapers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  gs_paper public.gs_paper,
  syllabus_topic TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  facts TEXT,
  issues TEXT,
  way_forward TEXT,
  static_topics TEXT[],
  is_important BOOLEAN DEFAULT FALSE,
  is_revised BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles policies (users can see articles from their own newspapers)
CREATE POLICY "Users can view articles from own newspapers"
  ON public.articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.newspapers
      WHERE newspapers.id = articles.newspaper_id
      AND newspapers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update articles from own newspapers"
  ON public.articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.newspapers
      WHERE newspapers.id = articles.newspaper_id
      AND newspapers.user_id = auth.uid()
    )
  );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newspapers_updated_at
  BEFORE UPDATE ON public.newspapers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for newspaper PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'newspapers',
  'newspapers',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
);

-- Storage policies for newspapers bucket
CREATE POLICY "Users can upload own newspapers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'newspapers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own newspapers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'newspapers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own newspapers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'newspapers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create index for better query performance
CREATE INDEX idx_newspapers_user_date ON public.newspapers(user_id, upload_date DESC);
CREATE INDEX idx_articles_newspaper ON public.articles(newspaper_id);
CREATE INDEX idx_articles_gs_paper ON public.articles(gs_paper);