-- Email System Migration
-- Adds email templates, email logs, and auto-send trigger

-- ============================================
-- 1. Enable pg_net extension for HTTP requests
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================
-- 2. Create email_templates table
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  html_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admin read policy
CREATE POLICY "Admins can read email templates"
  ON public.email_templates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Admin write policy
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Service role full access (for edge functions)
CREATE POLICY "Service role can access email templates"
  ON public.email_templates FOR SELECT
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Create email_logs table
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  booking_inquiry_id UUID REFERENCES public.booking_inquiries(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admin read policy
CREATE POLICY "Admins can read email logs"
  ON public.email_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Service role full access (for edge functions)
CREATE POLICY "Service role can manage email logs"
  ON public.email_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX idx_email_logs_booking_inquiry_id ON public.email_logs(booking_inquiry_id);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

-- ============================================
-- 4. Add notification tracking to booking_inquiries
-- ============================================
ALTER TABLE public.booking_inquiries 
  ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_status TEXT DEFAULT 'pending' 
    CHECK (notification_status IN ('pending', 'sent', 'failed'));

-- ============================================
-- 5. Insert default email templates
-- ============================================
INSERT INTO public.email_templates (name, description, subject, html_template) VALUES
(
  'booking_admin',
  'Email sent to admin when a new booking inquiry is received',
  'New Booking Inquiry from {{firstName}} {{lastName}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #1a472a; padding: 20px; text-align: center;">
    <h1 style="color: #fff; margin: 0;">New Booking Inquiry</h1>
  </div>
  <div style="padding: 20px; background: #f9f9f9;">
    <h2 style="color: #1a472a; border-bottom: 2px solid #c9a227; padding-bottom: 10px;">Customer Details</h2>
    <p><strong>Name:</strong> {{firstName}} {{lastName}}</p>
    <p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>
    <p><strong>Phone:</strong> {{phone}}</p>
    <p><strong>Country:</strong> {{country}}</p>
    
    <h2 style="color: #1a472a; border-bottom: 2px solid #c9a227; padding-bottom: 10px; margin-top: 20px;">Travel Details</h2>
    <p><strong>Tour:</strong> {{tourName}}</p>
    <p><strong>Theme:</strong> {{travelTheme}}</p>
    <p><strong>Destination:</strong> {{destination}}</p>
    <p><strong>Travel Date:</strong> {{travelDate}}</p>
    <p><strong>Duration:</strong> {{duration}}</p>
    <p><strong>Travelers:</strong> {{adults}} Adults, {{children}} Children (3-11 yrs), {{infants}} Infants (0-2 yrs)</p>
    <p><strong>Budget:</strong> {{budget}}</p>
    <p><strong>Services:</strong> {{services}}</p>
    
    <h2 style="color: #1a472a; border-bottom: 2px solid #c9a227; padding-bottom: 10px; margin-top: 20px;">Additional Information</h2>
    <p><strong>Special Requirements:</strong> {{specialRequirements}}</p>
    <p><strong>Message:</strong> {{message}}</p>
  </div>
  <div style="background: #1a472a; padding: 15px; text-align: center;">
    <p style="color: #fff; margin: 0; font-size: 12px;">Eika Africa Experience - Your Gateway to African Adventures</p>
  </div>
</div>'
),
(
  'booking_customer',
  'Confirmation email sent to customer after booking inquiry',
  'We''ve Received Your Safari Inquiry! 🌍',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #1a472a; padding: 30px; text-align: center;">
    <h1 style="color: #fff; margin: 0;">Thank You, {{firstName}}!</h1>
    <p style="color: #c9a227; margin-top: 10px;">Your African Adventure Awaits</p>
  </div>
  <div style="padding: 30px; background: #fff;">
    <p style="font-size: 16px; line-height: 1.6;">We''ve received your booking inquiry and are excited to help you plan your unforgettable African adventure.</p>
    <p style="font-size: 16px; line-height: 1.6;">One of our travel experts will review your request and get back to you within <strong>24 hours</strong>.</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #1a472a; margin-top: 0;">Your Inquiry Summary</h2>
      <p><strong>Tour Interest:</strong> {{tourName}}</p>
      <p><strong>Travel Date:</strong> {{travelDate}}</p>
      <p><strong>Travelers:</strong> {{adults}} Adults, {{children}} Children (3-11 yrs), {{infants}} Infants (0-2 yrs)</p>
      <p><strong>Budget:</strong> {{budget}}</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6;">If you have any urgent questions, please don''t hesitate to contact us:</p>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
      <p style="margin: 5px 0;">📧 <a href="mailto:inquiries@eikafricaexperience.com">inquiries@eikafricaexperience.com</a></p>
      <p style="margin: 5px 0;">📞 <a href="tel:+254116735102">+254 116 735 102</a></p>
    </div>
  </div>
  <div style="background: #1a472a; padding: 20px; text-align: center;">
    <p style="color: #c9a227; margin: 0 0 10px 0;">Best regards,</p>
    <p style="color: #fff; margin: 0; font-weight: bold;">The Eika Africa Experience Team</p>
    <p style="color: #fff; margin-top: 15px; font-size: 12px;">Nairobi, Kenya</p>
  </div>
</div>'
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 6. Create trigger function for auto-sending
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_booking_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT := 'https://uxdiipqxujzbzfizbhic.supabase.co';
  service_role_key TEXT;
BEGIN
  -- Get the service role key from vault (if available) or use anon key
  -- Note: In production, use Supabase Vault for secure key storage
  
  -- Call the edge function asynchronously using pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-booking-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := jsonb_build_object(
      'inquiryId', NEW.id,
      'firstName', NEW.first_name,
      'lastName', NEW.last_name,
      'email', NEW.email,
      'phone', COALESCE(NEW.phone, ''),
      'country', COALESCE(NEW.country, ''),
      'tourName', COALESCE(NEW.tour_name, ''),
      'travelTheme', COALESCE(NEW.travel_theme, ''),
      'destination', COALESCE(NEW.destination, ''),
      'travelDate', COALESCE(NEW.travel_date::text, ''),
      'duration', COALESCE(NEW.duration, ''),
      'adults', COALESCE(NEW.adults::text, '1'),
      'children', COALESCE(NEW.children::text, '0'),
      'infants', '0',
      'budget', COALESCE(NEW.budget, ''),
      'services', COALESCE(array_to_string(NEW.services, ', '), ''),
      'specialRequirements', COALESCE(NEW.special_requirements, ''),
      'message', COALESCE(NEW.message, ''),
      'fromTrigger', true
    )::text
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the insert
    RAISE WARNING 'Failed to send booking notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Create the trigger
-- ============================================
DROP TRIGGER IF EXISTS on_new_booking_inquiry ON public.booking_inquiries;

CREATE TRIGGER on_new_booking_inquiry
  AFTER INSERT ON public.booking_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_booking_inquiry();

-- ============================================
-- 8. Grant necessary permissions
-- ============================================
GRANT SELECT ON public.email_templates TO authenticated;
GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
GRANT ALL ON public.email_logs TO service_role;
