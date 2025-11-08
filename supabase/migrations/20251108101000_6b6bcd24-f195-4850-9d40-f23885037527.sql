-- Add new columns to color_profiles table
ALTER TABLE public.color_profiles 
ADD COLUMN camera_model text,
ADD COLUMN lens_model text,
ADD COLUMN lighting_conditions text,
ADD COLUMN category text,
ADD COLUMN tags text[],
ADD COLUMN download_count integer DEFAULT 0 NOT NULL,
ADD COLUMN view_count integer DEFAULT 0 NOT NULL,
ADD COLUMN featured boolean DEFAULT false NOT NULL;

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.color_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, profile_id)
);

-- Enable RLS on bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (auth.uid() = user_id);