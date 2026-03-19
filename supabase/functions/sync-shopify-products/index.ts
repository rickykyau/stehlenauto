import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCTS_QUERY = `
query Products($cursor: String) {
  products(first: 50, after: $cursor) {
    edges {
      node {
        id
        title
        vendor
        productType
        status
        tags
        updatedAt
        variants(first: 100) {
          edges {
            node {
              id
              title
              price
              sku
              inventoryQuantity
            }
          }
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        metafields(first: 50) {
          edges {
            node {
              namespace
              key
              value
              type
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

function extractGid(gid: string): string {
  // "gid://shopify/Product/123" -> "123"
  return gid.split("/").pop() || gid;
}

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

    const rawDomain = Deno.env.get("SHOPIFY_STORE_URL") || "";
    const shopDomain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const graphqlUrl = `https://${shopDomain}/admin/api/2024-01/graphql.json`;

    let allProducts: any[] = [];
    let cursor: string | null = null;
    let hasNext = true;
    let page = 0;

    // Fetch all products via GraphQL (includes metafields in same request)
    while (hasNext) {
      page++;
      console.log(`Fetching products page ${page}... (${allProducts.length} so far)`);

      const res = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { cursor },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Shopify GraphQL error ${res.status}: ${body}`);
      }

      const json = await res.json();
      if (json.errors) {
        throw new Error(`GraphQL errors: ${json.errors.map((e: any) => e.message).join(", ")}`);
      }

      const edges = json.data?.products?.edges || [];
      allProducts = allProducts.concat(edges.map((e: any) => e.node));

      const pageInfo = json.data?.products?.pageInfo;
      hasNext = pageInfo?.hasNextPage || false;
      cursor = pageInfo?.endCursor || null;

      if (allProducts.length >= 5000) break;

      // Small delay to respect rate limits
      if (hasNext) await new Promise((r) => setTimeout(r, 250));
    }

    console.log(`Fetched ${allProducts.length} products total, transforming...`);
    const now = new Date().toISOString();

    // Transform products
    const rows = allProducts.map((product: any) => {
      const tags = product.tags || [];
      const fitmentVehicles = tags
        .filter((t: string) => /^\d{4}/.test(t))
        .map((t: string) => {
          const parts = t.split(" ");
          return { year: parts[0], make: parts[1], model: parts.slice(2).join(" ") };
        });

      const metafields = (product.metafields?.edges || []).map((e: any) => e.node);

      // Extract CB Item Name from cb_integration.item_name or custom.part_number
      let cbItemName: string | null = null;
      for (const mf of metafields) {
        if (
          (mf.namespace === "cb_integration" && mf.key === "item_name") ||
          (mf.namespace === "custom" && mf.key === "part_number")
        ) {
          cbItemName = mf.value;
          break;
        }
      }

      const metafieldsClean = metafields.map((mf: any) => ({
        namespace: mf.namespace,
        key: mf.key,
        value: mf.value,
        type: mf.type,
      }));

      const variants = (product.variants?.edges || []).map((e: any) => {
        const v = e.node;
        return {
          id: extractGid(v.id),
          title: v.title,
          price: v.price,
          sku: v.sku,
          inventory_quantity: v.inventoryQuantity ?? 0,
          available: (v.inventoryQuantity ?? 0) > 0,
        };
      });

      const images = (product.images?.edges || []).map((e: any) => {
        const img = e.node;
        return {
          id: extractGid(img.id),
          src: img.url,
          alt: img.altText,
        };
      });

      return {
        shopify_product_id: extractGid(product.id),
        title: product.title,
        vendor: product.vendor,
        product_type: product.productType,
        status: product.status?.toLowerCase() || "active",
        tags,
        variants,
        images,
        fitment_vehicles: fitmentVehicles,
        cb_item_name: cbItemName,
        metafields: metafieldsClean,
        updated_at: product.updatedAt || now,
        last_synced_at: now,
      };
    });

    // Batch upsert
    let synced = 0;
    const CHUNK = 200;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const { count } = await supabase
        .from("products_cache")
        .upsert(rows.slice(i, i + CHUNK), { onConflict: "shopify_product_id", count: "exact" });
      synced += count ?? 0;
    }

    // Low stock alerts
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

    await supabase.from("site_settings").upsert(
      { key: "last_products_sync", value: { timestamp: now } },
      { onConflict: "key" }
    );

    console.log(`Sync complete: ${synced} products, ${alerts.length} alerts`);

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
