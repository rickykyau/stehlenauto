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

    const rawDomain = Deno.env.get("SHOPIFY_STORE_URL") || "yrmsvk-4k.myshopify.com";
    const shopDomain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const apiVersion = "2024-01";
    let allProducts: any[] = [];
    let pageInfo: string | null = null;
    let hasNext = true;

    // Fetch all products from Shopify
    while (hasNext) {
      const params = new URLSearchParams({ limit: "250" });
      if (pageInfo) params.set("page_info", pageInfo);

      const url = `https://${shopDomain}/admin/api/${apiVersion}/products.json?${params}`;
      const res = await fetch(url, {
        headers: { "X-Shopify-Access-Token": shopifyToken, "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Shopify API error ${res.status}: ${body}`);
      }

      const data = await res.json();
      allProducts = allProducts.concat(data.products || []);

      const linkHeader = res.headers.get("Link") || "";
      const nextMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)>[^;]*;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
      } else {
        hasNext = false;
      }
      if (allProducts.length >= 5000) break;
    }

    const now = new Date().toISOString();

    // Transform all products into rows
    const rows = allProducts.map((product: any) => {
      const tags = product.tags ? product.tags.split(", ") : [];
      const fitmentVehicles = tags
        .filter((t: string) => /^\d{4}/.test(t))
        .map((t: string) => {
          const parts = t.split(" ");
          return { year: parts[0], make: parts[1], model: parts.slice(2).join(" ") };
        });

      return {
        shopify_product_id: String(product.id),
        title: product.title,
        vendor: product.vendor,
        product_type: product.product_type,
        status: product.status || "active",
        tags,
        variants: (product.variants || []).map((v: any) => ({
          id: String(v.id), title: v.title, price: v.price, sku: v.sku,
          inventory_quantity: v.inventory_quantity ?? 0, available: v.inventory_quantity > 0,
        })),
        images: (product.images || []).map((img: any) => ({
          id: String(img.id), src: img.src, alt: img.alt,
        })),
        fitment_vehicles: fitmentVehicles,
        updated_at: product.updated_at || now,
        last_synced_at: now,
      };
    });

    // Batch upsert in chunks of 200 for speed
    let synced = 0;
    const CHUNK = 200;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const { count } = await supabase
        .from("products_cache")
        .upsert(rows.slice(i, i + CHUNK), { onConflict: "shopify_product_id", count: "exact" });
      synced += count ?? 0;
    }

    // Low stock alerts: query from DB after upsert
    const { data: lowStock } = await supabase
      .from("products_cache")
      .select("id, title, variants")
      .order("title");
    
    const alerts: any[] = [];
    for (const p of (lowStock || [])) {
      for (const v of (p.variants as any[] || [])) {
        if (v.inventory_quantity < 10) {
          alerts.push({
            product_id: p.id,
            variant_id: v.id,
            variant_title: `${p.title} - ${v.title}`,
            current_quantity: v.inventory_quantity,
            threshold: 10,
            alert_status: "active",
          });
        }
      }
    }

    await supabase.from("inventory_alerts").delete().eq("alert_status", "active");
    if (alerts.length > 0) {
      for (let i = 0; i < alerts.length; i += 200) {
        await supabase.from("inventory_alerts").insert(alerts.slice(i, i + 200));
      }
    }

    // Update last sync timestamp
    await supabase.from("site_settings").upsert(
      { key: "last_products_sync", value: { timestamp: now } },
      { onConflict: "key" }
    );

    return new Response(
      JSON.stringify({ success: true, synced, total: allProducts.length, alerts: alerts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync-shopify-products error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
