import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uxdiipqxujzbzfizbhic.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  inquiryId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  tourName?: string;
  travelTheme?: string;
  destination?: string;
  travelDate?: string;
  duration?: string;
  adults?: string;
  children?: string;
  infants?: string;
  budget?: string;
  services?: string[] | string;
  specialRequirements?: string;
  message?: string;
  fromTrigger?: boolean;
}

interface EmailTemplate {
  name: string;
  subject: string;
  html_template: string;
}

// Replace {{placeholder}} tokens with actual values
function renderTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || "Not provided";
  });
}

// Create Supabase client for logging
function getSupabaseClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not set, email logging disabled");
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Log email to database
async function logEmail(
  supabase: any,
  templateName: string,
  recipientEmail: string,
  recipientName: string,
  subject: string,
  status: "sent" | "failed",
  inquiryId?: string,
  errorMessage?: string
) {
  if (!supabase) return;
  
  try {
    await supabase.from("email_logs").insert({
      template_name: templateName,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject: subject,
      status: status,
      error_message: errorMessage,
      booking_inquiry_id: inquiryId,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    });
  } catch (err) {
    console.error("Failed to log email:", err);
  }
}

// Update booking inquiry notification status
async function updateInquiryNotificationStatus(
  supabase: any,
  inquiryId: string,
  status: "sent" | "failed"
) {
  if (!supabase || !inquiryId) return;
  
  try {
    await supabase
      .from("booking_inquiries")
      .update({
        notification_status: status,
        notification_sent_at: status === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", inquiryId);
  } catch (err) {
    console.error("Failed to update inquiry notification status:", err);
  }
}

// Fetch email templates from database
async function getTemplates(supabase: any): Promise<Map<string, EmailTemplate> | null> {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from("email_templates")
      .select("name, subject, html_template")
      .eq("is_active", true);
    
    if (error || !data) return null;
    
    const templates = new Map<string, EmailTemplate>();
    data.forEach((t: EmailTemplate) => templates.set(t.name, t));
    return templates;
  } catch (err) {
    console.error("Failed to fetch templates:", err);
    return null;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseClient();

  try {
    const data: BookingRequest = await req.json();
    console.log("Received booking inquiry:", data.fromTrigger ? "(from trigger)" : "(from frontend)");

    // Normalize services to string
    const servicesStr = Array.isArray(data.services) 
      ? data.services.join(", ") 
      : (data.services || "None selected");

    // Template data for placeholder replacement
    const templateData: Record<string, string> = {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "Not provided",
      country: data.country || "Not provided",
      tourName: data.tourName || "Not specified",
      travelTheme: data.travelTheme || "Not specified",
      destination: data.destination || "Not specified",
      travelDate: data.travelDate || "Flexible",
      duration: data.duration || "Not specified",
      adults: data.adults || "1",
      children: data.children || "0",
      infants: data.infants || "0",
      budget: data.budget || "Not specified",
      services: servicesStr,
      specialRequirements: data.specialRequirements || "None",
      message: data.message || "None",
    };

    // Try to fetch templates from database
    const templates = await getTemplates(supabase);
    
    // Get admin template (with fallback)
    let adminSubject = `New Booking Inquiry from ${data.firstName} ${data.lastName}`;
    let adminHtml = getDefaultAdminTemplate(templateData);
    
    if (templates?.has("booking_admin")) {
      const adminTemplate = templates.get("booking_admin")!;
      adminSubject = renderTemplate(adminTemplate.subject, templateData);
      adminHtml = renderTemplate(adminTemplate.html_template, templateData);
    }

    // Get customer template (with fallback)
    let customerSubject = "We've Received Your Safari Inquiry! 🌍";
    let customerHtml = getDefaultCustomerTemplate(templateData);
    
    if (templates?.has("booking_customer")) {
      const customerTemplate = templates.get("booking_customer")!;
      customerSubject = renderTemplate(customerTemplate.subject, templateData);
      customerHtml = renderTemplate(customerTemplate.html_template, templateData);
    }

    // Send notification to business
    const businessEmailPayload = {
      sender: { 
        name: "Eika Africa Experience", 
        email: "noreply@eikafricaexperience.com" 
      },
      to: [{ 
        email: "inquiries@eikafricaexperience.com", 
        name: "Eika Africa Team" 
      }],
      subject: adminSubject,
      htmlContent: adminHtml,
    };

    const businessResponse = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify(businessEmailPayload),
    });

    if (!businessResponse.ok) {
      const error = await businessResponse.text();
      console.error("Business email failed:", error);
      await logEmail(supabase, "booking_admin", "inquiries@eikafricaexperience.com", "Eika Africa Team", adminSubject, "failed", data.inquiryId, error);
      throw new Error(`Failed to send business notification: ${error}`);
    }

    console.log("Business notification sent successfully");
    await logEmail(supabase, "booking_admin", "inquiries@eikafricaexperience.com", "Eika Africa Team", adminSubject, "sent", data.inquiryId);

    // Send confirmation to customer
    const customerEmailPayload = {
      sender: { 
        name: "Eika Africa Experience", 
        email: "noreply@eikafricaexperience.com" 
      },
      to: [{ 
        email: data.email, 
        name: `${data.firstName} ${data.lastName}` 
      }],
      subject: customerSubject,
      htmlContent: customerHtml,
    };

    const customerResponse = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify(customerEmailPayload),
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.text();
      console.error("Customer email failed:", error);
      await logEmail(supabase, "booking_customer", data.email, `${data.firstName} ${data.lastName}`, customerSubject, "failed", data.inquiryId, error);
      throw new Error(`Failed to send customer confirmation: ${error}`);
    }

    console.log("Customer confirmation sent successfully");
    await logEmail(supabase, "booking_customer", data.email, `${data.firstName} ${data.lastName}`, customerSubject, "sent", data.inquiryId);

    // Update inquiry notification status
    if (data.inquiryId) {
      await updateInquiryNotificationStatus(supabase, data.inquiryId, "sent");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending emails:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

// Default admin email template (fallback if database template not available)
function getDefaultAdminTemplate(data: Record<string, string>): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a472a; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">New Booking Inquiry</h1>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #1a472a; border-bottom: 2px solid #c9a227; padding-bottom: 10px;">Customer Details</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Country:</strong> ${data.country}</p>
        
        <h2 style="color: #1a472a; border-bottom: 2px solid #c9a227; padding-bottom: 10px; margin-top: 20px;">Travel Details</h2>
        <p><strong>Tour:</strong> ${data.tourName}</p>
        <p><strong>Theme:</strong> ${data.travelTheme}</p>
        <p><strong>Destination:</strong> ${data.destination}</p>
        <p><strong>Travel Date:</strong> ${data.travelDate}</p>
        <p><strong>Duration:</strong> ${data.duration}</p>
        <p><strong>Travelers:</strong> ${data.adults} Adults, ${data.children} Children (3-11 yrs), ${data.infants} Infants (0-2 yrs)</p>
        <p><strong>Budget:</strong> ${data.budget}</p>
        <p><strong>Services:</strong> ${data.services}</p>
        
        <h2 style="color: #1a472a; border-bottom: 2px solid #c9a227; padding-bottom: 10px; margin-top: 20px;">Additional Information</h2>
        <p><strong>Special Requirements:</strong> ${data.specialRequirements}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      </div>
      <div style="background: #1a472a; padding: 15px; text-align: center;">
        <p style="color: #fff; margin: 0; font-size: 12px;">Eika Africa Experience - Your Gateway to African Adventures</p>
      </div>
    </div>
  `;
}

// Default customer email template (fallback if database template not available)
function getDefaultCustomerTemplate(data: Record<string, string>): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a472a; padding: 30px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Thank You, ${data.firstName}!</h1>
        <p style="color: #c9a227; margin-top: 10px;">Your African Adventure Awaits</p>
      </div>
      <div style="padding: 30px; background: #fff;">
        <p style="font-size: 16px; line-height: 1.6;">We've received your booking inquiry and are excited to help you plan your unforgettable African adventure.</p>
        <p style="font-size: 16px; line-height: 1.6;">One of our travel experts will review your request and get back to you within <strong>24 hours</strong>.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1a472a; margin-top: 0;">Your Inquiry Summary</h2>
          <p><strong>Tour Interest:</strong> ${data.tourName}</p>
          <p><strong>Travel Date:</strong> ${data.travelDate}</p>
          <p><strong>Travelers:</strong> ${data.adults} Adults, ${data.children} Children (3-11 yrs), ${data.infants} Infants (0-2 yrs)</p>
          <p><strong>Budget:</strong> ${data.budget}</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">If you have any urgent questions, please don't hesitate to contact us:</p>
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
    </div>
  `;
}

serve(handler);