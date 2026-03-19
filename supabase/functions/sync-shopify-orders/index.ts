import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const shopifyToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) throw new Error("Unauthorized");
      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (!isAdmin) throw new Error("Forbidden");
    }

    const shopDomain = "yrmsvk-4k.myshopify.com";
    const apiVersion = "2025-01";
    let allOrders: any[] = [];
    let pageInfo: string | null = null;
    let hasNext = true;

    // Paginate through orders
    while (hasNext) {
      const params = new URLSearchParams({ limit: "250", status: "any" });
      if (pageInfo) params.set("page_info", pageInfo);

      const url = `https://${shopDomain}/admin/api/${apiVersion}/orders.json?${params}`;
      const res = await fetch(url, {
        headers: { "X-Shopify-Access-Token": shopifyToken, "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Shopify API error ${res.status}: ${body}`);
      }

      const data = await res.json();
      allOrders = allOrders.concat(data.orders || []);

      // Check for next page
      const linkHeader = res.headers.get("Link") || "";
      const nextMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)>[^;]*;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
      } else {
        hasNext = false;
      }

      // Safety limit
      if (allOrders.length >= 2000) break;
    }

    // Get all profiles for email matching
    const { data: profiles } = await supabase.from("profiles").select("user_id");

    // Get user emails via auth admin (we'll match by order email)
    // For now, we match by looking up profiles with user_id
    
    let synced = 0;
    for (const order of allOrders) {
      const discountCodes = order.discount_codes || [];
      const promoCode = discountCodes.length > 0 ? discountCodes[0].code : null;

      const row = {
        shopify_order_id: String(order.id),
        order_number: String(order.order_number || order.name),
        email: order.email || null,
        customer_name: order.customer
          ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
          : null,
        total_price: parseFloat(order.total_price || "0"),
        subtotal_price: parseFloat(order.subtotal_price || "0"),
        discount_amount: parseFloat(order.total_discounts || "0"),
        promo_code_used: promoCode,
        financial_status: order.financial_status || "pending",
        fulfillment_status: order.fulfillment_status || "unfulfilled",
        line_items: (order.line_items || []).map((li: any) => ({
          title: li.title,
          quantity: li.quantity,
          price: li.price,
          sku: li.sku,
          variant_title: li.variant_title,
          image: li.image,
        })),
        shipping_address: order.shipping_address || null,
        created_at: order.created_at,
        updated_at: order.updated_at || new Date().toISOString(),
      };

      const { error } = await supabase
        .from("orders")
        .upsert(row, { onConflict: "shopify_order_id" });

      if (!error) synced++;
    }

    // Update last sync timestamp in site_settings
    await supabase.from("site_settings").upsert(
      { key: "last_orders_sync", value: { timestamp: new Date().toISOString() } },
      { onConflict: "key" }
    );

    return new Response(JSON.stringify({ success: true, synced, total: allOrders.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sync-shopify-orders error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
