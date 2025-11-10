-- Function to increment view count for a profile
CREATE OR REPLACE FUNCTION public.increment_view_count(profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.color_profiles
  SET view_count = view_count + 1
  WHERE id = profile_id;
END;
$$;

-- Function to increment download count for a profile
CREATE OR REPLACE FUNCTION public.increment_download_count(profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.color_profiles
  SET download_count = download_count + 1
  WHERE id = profile_id;
END;
$$;