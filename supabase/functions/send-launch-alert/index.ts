import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  // Check admin role from DB (not hardcoded emails)
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { propertyId, message, subject } = body;
  if (!message) {
    return new Response(JSON.stringify({ error: "message is required" }), { status: 400, headers: corsHeaders });
  }

  // Fetch active, un-notified subscribers
  let query = supabase
    .from("launch_alerts")
    .select("id, email, name, phone")
    .eq("active", true)
    .eq("notified", false);
  if (propertyId) query = query.eq("property_id", propertyId);

  const { data: subscribers, error: fetchErr } = await query;
  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500, headers: corsHeaders });
  }

  const recipients = subscribers ?? [];
  if (recipients.length === 0) {
    return new Response(
      JSON.stringify({ success: true, sent: 0, message: "No pending subscribers" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const emailApiKey = Deno.env.get("RESEND_API_KEY");
  let emailsSent = 0;
  const errors: string[] = [];

  if (emailApiKey) {
    // Send via Resend
    for (const sub of recipients) {
      if (!sub.email) continue;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${emailApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Avenue Real Estate <noreply@avenuerealestate.in>",
          to: [sub.email],
          subject: subject || "New Property Launch — Avenue Real Estate",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#1e293b;">Hi ${sub.name || "there"},</h2>
              <p style="color:#475569;line-height:1.6;">${message}</p>
              <p style="margin-top:24px;">
                <a href="https://avenuerealestate.in/projects" 
                   style="background:#d4a017;color:#1e293b;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                  View Projects
                </a>
              </p>
              <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                You're receiving this because you subscribed to launch alerts.<br/>
                Avenue Real Estate, Sohna, Gurugram, Haryana.
              </p>
            </div>`,
        }),
      });
      if (res.ok) {
        emailsSent++;
      } else {
        const errBody = await res.text();
        errors.push(`${sub.email}: ${errBody}`);
      }
    }
  }

  // Mark all fetched subscribers as notified regardless of email success
  const ids = recipients.map((s) => s.id);
  await supabase.from("launch_alerts").update({ notified: true }).in("id", ids);

  return new Response(
    JSON.stringify({
      success: true,
      total_subscribers: recipients.length,
      emails_sent: emailsSent,
      email_service: emailApiKey ? "resend" : "not_configured",
      errors: errors.length > 0 ? errors : undefined,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
