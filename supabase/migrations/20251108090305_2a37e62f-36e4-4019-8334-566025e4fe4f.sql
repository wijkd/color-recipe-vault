-- Add unique constraint to ensure one rating per user per profile
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_user_profile_unique UNIQUE (user_id, profile_id);