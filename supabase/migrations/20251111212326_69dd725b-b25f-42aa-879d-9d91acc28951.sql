-- Create camera_models table
CREATE TABLE public.camera_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create lens_models table
CREATE TABLE public.lens_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.camera_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lens_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for camera_models
CREATE POLICY "Camera models viewable by everyone"
  ON public.camera_models FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add camera models"
  ON public.camera_models FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update camera models"
  ON public.camera_models FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete camera models"
  ON public.camera_models FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for lens_models
CREATE POLICY "Lens models viewable by everyone"
  ON public.lens_models FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add lens models"
  ON public.lens_models FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update lens models"
  ON public.lens_models FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lens models"
  ON public.lens_models FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Insert some default camera models
INSERT INTO public.camera_models (name) VALUES
  ('OM-1'),
  ('OM-5'),
  ('E-M1 Mark III'),
  ('E-M5 Mark III'),
  ('E-M10 Mark IV');

-- Insert some default lens models
INSERT INTO public.lens_models (name) VALUES
  ('M.Zuiko 12-40mm f/2.8 PRO'),
  ('M.Zuiko 40-150mm f/2.8 PRO'),
  ('M.Zuiko 17mm f/1.8'),
  ('M.Zuiko 25mm f/1.8'),
  ('M.Zuiko 45mm f/1.8');