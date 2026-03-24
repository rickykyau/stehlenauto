import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyHmac(body: string, hmacHeader: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return computed === hmacHeader;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const rawBody = await req.text();

    // Verify HMAC
    const apiSecret = Deno.env.get("SHOPIFY_API_SECRET");
    if (!apiSecret || !hmacHeader) {
      console.error("Missing HMAC header or API secret");
      return new Response("Unauthorized", { status: 401 });
    }

    const valid = await verifyHmac(rawBody, hmacHeader, apiSecret);
    if (!valid) {
      console.error("Invalid HMAC signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const order = JSON.parse(rawBody);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up user by email
    let userId: string | null = null;
    const orderEmail = order.email || order.contact_email;
    if (orderEmail) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const matched = users?.users?.find(
        (u: any) => u.email?.toLowerCase() === orderEmail.toLowerCase()
      );
      if (matched) userId = matched.id;
    }

    const lineItems = (order.line_items || []).map((li: any) => ({
      title: li.title,
      quantity: li.quantity,
      price: li.price,
      sku: li.sku || null,
      image_url: li.image?.src || null,
    }));

    const row = {
      shopify_order_id: String(order.id),
      order_number: order.name || `#${order.order_number}`,
      email: orderEmail || null,
      customer_name: order.customer
        ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
        : null,
      user_id: userId,
      total_price: parseFloat(order.total_price || "0"),
      subtotal_price: parseFloat(order.subtotal_price || "0"),
      currency_code: order.currency || "USD",
      financial_status: order.financial_status || "pending",
      fulfillment_status: order.fulfillment_status || "unfulfilled",
      discount_amount: parseFloat(order.total_discounts || "0"),
      promo_code_used: order.discount_codes?.[0]?.code || null,
      line_items: lineItems,
      shipping_address: order.shipping_address || null,
      created_at: order.created_at,
      updated_at: order.updated_at || new Date().toISOString(),
      synced_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("orders")
      .upsert(row, { onConflict: "shopify_order_id" });

    if (error) {
      console.error("Upsert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
