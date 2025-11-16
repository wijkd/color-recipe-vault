-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert contact messages
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Only admins can view contact messages
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can update contact messages
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete contact messages
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'));