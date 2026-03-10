import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify that the request is made with the service role key (server-side only)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Only allow calls made with the service role key (not user JWTs)
    if (token !== serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: This endpoint requires service role access" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const { email, password } = await req.json();
    
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!password || typeof password !== "string" || password.length < 12) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 12 characters long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check password complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return new Response(
        JSON.stringify({ 
          error: "Password must contain uppercase, lowercase, number, and special character" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // Check if already an admin
      const { data: existingAdmin } = await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("user_id", existingUser.id)
        .maybeSingle();

      if (existingAdmin) {
        return new Response(
          JSON.stringify({ message: "Admin user already exists" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add existing user as admin
      const { error: adminError } = await supabaseAdmin
        .from("admin_users")
        .insert({ user_id: existingUser.id, email });

      if (adminError) throw adminError;

      return new Response(
        JSON.stringify({ message: "Existing user promoted to admin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;

    // Add to admin_users table
    const { error: adminError } = await supabaseAdmin
      .from("admin_users")
      .insert({ user_id: newUser.user.id, email });

    if (adminError) throw adminError;

    console.log(`Admin user created: ${email}`);

    return new Response(
      JSON.stringify({ message: "Admin user created successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while creating admin user" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
