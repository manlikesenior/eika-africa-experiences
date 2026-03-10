-- Add category column to tours table
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS category text;

-- Create an index for category filtering
CREATE INDEX IF NOT EXISTS idx_tours_category ON public.tours(category);