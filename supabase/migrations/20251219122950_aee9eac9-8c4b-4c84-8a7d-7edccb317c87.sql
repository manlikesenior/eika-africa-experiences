-- Create tours table
CREATE TABLE public.tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  overview TEXT,
  duration TEXT NOT NULL,
  price DECIMAL(10,2),
  price_note TEXT,
  destinations TEXT[],
  highlights TEXT[],
  inclusions TEXT[],
  exclusions TEXT[],
  itinerary JSONB,
  image_url TEXT,
  gallery TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking inquiries table
CREATE TABLE public.booking_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES public.tours(id),
  tour_name TEXT,
  
  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  
  -- Travel details
  travel_theme TEXT,
  destination TEXT,
  travel_date DATE,
  duration TEXT,
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  budget TEXT,
  
  -- Additional
  services TEXT[],
  special_requirements TEXT,
  message TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table for dashboard access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Tours policies (public read, admin write)
CREATE POLICY "Tours are viewable by everyone" 
ON public.tours FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage tours" 
ON public.tours FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Booking inquiries policies (anyone can insert, admins can view/update)
CREATE POLICY "Anyone can create booking inquiries" 
ON public.booking_inquiries FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all booking inquiries" 
ON public.booking_inquiries FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update booking inquiries" 
ON public.booking_inquiries FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Admin users policies
CREATE POLICY "Admins can view admin users" 
ON public.admin_users FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON public.tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_inquiries_updated_at
BEFORE UPDATE ON public.booking_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();