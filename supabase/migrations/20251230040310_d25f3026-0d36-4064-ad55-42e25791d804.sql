-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Blogs are viewable by everyone when published
CREATE POLICY "Published blogs are viewable by everyone"
ON public.blogs
FOR SELECT
USING (is_published = true);

-- Admins can manage all blogs
CREATE POLICY "Admins can manage blogs"
ON public.blogs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

-- Create email subscribers table
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  is_subscribed BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'website',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email_subscribers
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
ON public.email_subscribers
FOR INSERT
WITH CHECK (true);

-- Admins can view all subscribers
CREATE POLICY "Admins can view subscribers"
ON public.email_subscribers
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

-- Admins can update subscribers
CREATE POLICY "Admins can update subscribers"
ON public.email_subscribers
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

-- Admins can delete subscribers
CREATE POLICY "Admins can delete subscribers"
ON public.email_subscribers
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

-- Add trigger for blogs updated_at
CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'uploads' AND EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'uploads' AND EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));