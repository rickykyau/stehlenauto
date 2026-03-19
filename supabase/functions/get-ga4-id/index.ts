import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ga4Id = Deno.env.get("GA4_MEASUREMENT_ID");
  return new Response(JSON.stringify({ id: ga4Id || null }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
