-- Create reports table
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.color_profiles(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add visible field to color_profiles (default true)
ALTER TABLE public.color_profiles
ADD COLUMN visible boolean NOT NULL DEFAULT true;

-- Add banned field to profiles table (default false)
ALTER TABLE public.profiles
ADD COLUMN banned boolean NOT NULL DEFAULT false;

-- Enable RLS on reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for reports table
CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create reports"
ON public.reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Function to auto-hide profile when reported
CREATE OR REPLACE FUNCTION public.hide_profile_on_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hide the profile when a report is created
  UPDATE public.color_profiles
  SET visible = false
  WHERE id = NEW.profile_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-hide profile on report
CREATE TRIGGER on_report_created
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.hide_profile_on_report();

-- Update RLS policy for color_profiles to only show visible ones to public
DROP POLICY IF EXISTS "Color profiles are viewable by everyone" ON public.color_profiles;

CREATE POLICY "Visible color profiles are viewable by everyone"
ON public.color_profiles
FOR SELECT
USING (visible = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));