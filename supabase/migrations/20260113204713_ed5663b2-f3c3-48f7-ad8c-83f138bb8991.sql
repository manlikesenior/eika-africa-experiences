-- Add pricing tiers column to tours table
ALTER TABLE public.tours 
ADD COLUMN pricing_tiers jsonb DEFAULT NULL;

-- Add comment explaining the structure
COMMENT ON COLUMN public.tours.pricing_tiers IS 'JSON object with silver, gold, platinum tiers. Each tier has: price (number), description (string), accommodation_level (string)';

-- Add selected tier to booking inquiries
ALTER TABLE public.booking_inquiries 
ADD COLUMN selected_tier text DEFAULT 'silver';

-- Update comment
COMMENT ON COLUMN public.booking_inquiries.selected_tier IS 'Selected pricing tier: silver, gold, or platinum';