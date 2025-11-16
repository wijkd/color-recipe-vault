-- Create resources table for external links
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Resources are viewable by everyone
CREATE POLICY "Resources are viewable by everyone"
ON public.resources
FOR SELECT
USING (true);

-- Only admins can insert resources
CREATE POLICY "Admins can insert resources"
ON public.resources
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update resources
CREATE POLICY "Admins can update resources"
ON public.resources
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete resources
CREATE POLICY "Admins can delete resources"
ON public.resources
FOR DELETE
USING (has_role(auth.uid(), 'admin'));