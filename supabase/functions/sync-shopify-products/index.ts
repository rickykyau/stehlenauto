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

    console.log(`Fetching products from ${shopDomain}...`);

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
      console.log(`Fetched ${allProducts.length} products so far...`);

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
    const lowStockAlerts: any[] = [];

    // Build rows for batch upsert
    const rows = allProducts.map((product: any) => {
      const tags = product.tags ? product.tags.split(", ") : [];
      const fitmentVehicles = tags
        .filter((t: string) => /^\d{4}/.test(t))
        .map((t: string) => {
          const parts = t.split(" ");
          return { year: parts[0], make: parts[1], model: parts.slice(2).join(" ") };
        });

      const variants = (product.variants || []).map((v: any) => ({
        id: String(v.id),
        title: v.title,
        price: v.price,
        sku: v.sku,
        inventory_quantity: v.inventory_quantity ?? 0,
        available: v.inventory_quantity > 0,
      }));

      const images = (product.images || []).map((img: any) => ({
        id: String(img.id),
        src: img.src,
        alt: img.alt,
      }));

      return {
        shopify_product_id: String(product.id),
        title: product.title,
        vendor: product.vendor,
        product_type: product.product_type,
        status: product.status || "active",
        tags,
        variants,
        images,
        fitment_vehicles: fitmentVehicles,
        updated_at: product.updated_at || now,
        last_synced_at: now,
      };
    });

    // Batch upsert in chunks of 50
    let synced = 0;
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { data: upserted, error } = await supabase
        .from("products_cache")
        .upsert(chunk, { onConflict: "shopify_product_id" })
        .select("id, variants");

      if (!error && upserted) {
        synced += upserted.length;
        // Check low stock
        for (const item of upserted) {
          const product = allProducts.find((p: any) => rows.find((r: any) => r.shopify_product_id === String(p.id))?.shopify_product_id === chunk.find((c: any) => {
            // Match by finding the upserted row
            return true;
          })?.shopify_product_id);
          for (const v of (item.variants as any[] || [])) {
            if (v.inventory_quantity < 10) {
              lowStockAlerts.push({
                product_id: item.id,
                variant_id: v.id,
                variant_title: v.title,
                current_quantity: v.inventory_quantity,
                threshold: 10,
                alert_status: "active",
              });
            }
          }
        }
      }
      console.log(`Upserted ${Math.min(i + 50, rows.length)}/${rows.length} products...`);
    }

    // Clear old active alerts and insert new ones
    await supabase.from("inventory_alerts").delete().eq("alert_status", "active");
    if (lowStockAlerts.length > 0) {
      for (let i = 0; i < lowStockAlerts.length; i += 100) {
        await supabase.from("inventory_alerts").insert(lowStockAlerts.slice(i, i + 100));
      }
    }

    // Update last sync timestamp
    await supabase.from("site_settings").upsert(
      { key: "last_products_sync", value: { timestamp: now } },
      { onConflict: "key" }
    );

    console.log(`Sync complete: ${synced} products, ${lowStockAlerts.length} alerts`);

    return new Response(
      JSON.stringify({ success: true, synced, total: allProducts.length, alerts: lowStockAlerts.length }),
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
