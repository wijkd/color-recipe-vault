-- Add social media and website fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS website_url text;

-- Update the handle_new_user function to include these fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile with additional fields from metadata
  INSERT INTO public.profiles (id, username, instagram_url, website_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'instagram_url',
    NEW.raw_user_meta_data->>'website_url'
  );
  
  -- Assign contributor role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'contributor');
  
  RETURN NEW;
END;
$function$;