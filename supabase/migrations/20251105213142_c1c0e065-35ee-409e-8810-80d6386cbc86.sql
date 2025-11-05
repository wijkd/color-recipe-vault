-- Fix user_id foreign keys to reference public.profiles instead of auth.users
-- 1) color_profiles.user_id -> profiles.id
ALTER TABLE public.color_profiles
DROP CONSTRAINT IF EXISTS color_profiles_user_id_fkey;
ALTER TABLE public.color_profiles
ADD CONSTRAINT color_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2) comments.user_id -> profiles.id
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3) ratings.user_id -> profiles.id
ALTER TABLE public.ratings
DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE public.ratings
ADD CONSTRAINT ratings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;