-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix search_path for update_profile_rating function
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.color_profiles
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.ratings
      WHERE profile_id = COALESCE(NEW.profile_id, OLD.profile_id)
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE profile_id = COALESCE(NEW.profile_id, OLD.profile_id)
    )
  WHERE id = COALESCE(NEW.profile_id, OLD.profile_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;