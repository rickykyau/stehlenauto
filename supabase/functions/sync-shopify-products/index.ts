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
        handle
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
  return gid.split("/").pop() || gid;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const shopifyToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const updateSyncStatus = async (fields: Record<string, any>) => {
    await supabase
      .from("sync_status")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("sync_type", "products");
  };

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) throw new Error("Unauthorized");
      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (!isAdmin) throw new Error("Forbidden");
    }

    // Mark sync as in_progress
    await updateSyncStatus({
      status: "in_progress",
      progress: 0,
      total: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
    });

    const rawDomain = Deno.env.get("SHOPIFY_STORE_URL") || "";
    const shopDomain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const graphqlUrl = `https://${shopDomain}/admin/api/2024-01/graphql.json`;

    let allProducts: any[] = [];
    let cursor: string | null = null;
    let hasNext = true;
    let page = 0;

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

      // Update progress after each page
      await updateSyncStatus({ progress: allProducts.length, total: hasNext ? allProducts.length + 50 : allProducts.length });

      if (allProducts.length >= 5000) break;
      if (hasNext) await new Promise((r) => setTimeout(r, 250));
    }

    console.log(`Fetched ${allProducts.length} products total, transforming...`);
    const now = new Date().toISOString();

    // Update status: now upserting
    await updateSyncStatus({ total: allProducts.length });

    const rows = allProducts.map((product: any) => {
      const tags = product.tags || [];
      const fitmentVehicles = tags
        .filter((t: string) => /^\d{4}/.test(t))
        .map((t: string) => {
          const parts = t.split(" ");
          return { year: parts[0], make: parts[1], model: parts.slice(2).join(" ") };
        });

      const metafields = (product.metafields?.edges || []).map((e: any) => e.node);

      // Extract CB Item Name from cb_integration.item_name ONLY
      let cbItemName: string | null = null;
      let partNumber: string | null = null;
      let fitmentSubattributes: any = null;
      let fitmentNotesVal: string | null = null;
      for (const mf of metafields) {
        if (mf.namespace === "cb_integration" && mf.key === "item_name") {
          cbItemName = mf.value;
        }
        if (mf.namespace === "custom" && mf.key === "part_number") {
          partNumber = mf.value;
        }
        if (mf.namespace === "custom" && mf.key === "fitment_subattributes") {
          try {
            fitmentSubattributes = JSON.parse(mf.value);
          } catch { fitmentSubattributes = null; }
        }
        if (mf.namespace === "custom" && mf.key === "fitment_notes") {
          fitmentNotesVal = mf.value;
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
        handle: product.handle || null,
        vendor: product.vendor,
        product_type: product.productType,
        status: product.status?.toLowerCase() || "active",
        tags,
        variants,
        images,
        fitment_vehicles: fitmentVehicles,
        cb_item_name: cbItemName,
        part_number: partNumber,
        metafields: metafieldsClean,
        fitment_subattributes: fitmentSubattributes,
        fitment_notes: fitmentNotesVal,
        updated_at: product.updatedAt || now,
        last_synced_at: now,
      };
    });

    // Batch upsert with progress
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

    // ── Build YMM config from synced products ──
    console.log("Building YMM config from products_cache...");
    const { data: allCachedProducts } = await supabase
      .from("products_cache")
      .select("tags")
      .eq("status", "active");

    const knownMakes = new Set([
      "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chevy", "Chrysler",
      "Dodge", "Ford", "GMC", "Honda", "Hummer", "Hyundai", "Infiniti", "Isuzu",
      "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes", "Mercury",
      "Mini", "Mitsubishi", "Nissan", "Pontiac", "Ram", "Scion", "Subaru", "Suzuki",
      "Tesla", "Toyota", "Volkswagen", "Volvo",
    ]);

    const makeCollectionMap: Record<string, string> = {
      "Acura": "acura-parts", "Audi": "audi-parts", "Buick": "buick-parts",
      "Cadillac": "cadillac-parts", "Chevrolet": "chevy-parts", "Chevy": "chevy-parts",
      "Chrysler": "chrysler-parts", "Dodge": "dodge-parts", "Ford": "ford-parts",
      "GMC": "gmc-parts", "Honda": "honda-parts", "Hyundai": "hyundai-parts",
      "Infiniti": "infiniti-parts", "Jeep": "jeep-parts", "Kia": "kia-parts",
      "Lexus": "lexus-parts", "Lincoln": "lincoln-parts", "Mazda": "mazda-parts",
      "Mercedes": "mercedes-benz-parts", "Mercury": "mercury-parts",
      "Nissan": "nissan-parts", "Pontiac": "pontiac-parts", "Ram": "dodge-parts",
      "Subaru": "subaru-parts", "Toyota": "toyota-parts", "Volkswagen": "volkswagen-parts",
    };

    const foundMakes = new Set<string>();
    const foundYears = new Set<string>();
    const makeModelMap = new Map<string, Set<string>>();

    for (const product of (allCachedProducts || [])) {
      const tags: string[] = product.tags || [];
      const productMakes = new Set<string>();

      for (const tag of tags) {
        // Years: exact 4-digit tags
        if (/^\d{4}$/.test(tag)) {
          const y = parseInt(tag);
          if (y >= 1980 && y <= 2030) foundYears.add(tag);
          continue;
        }
        // Makes: exact known make OR "make:" prefix
        if (knownMakes.has(tag)) {
          foundMakes.add(tag);
          productMakes.add(tag);
          if (!makeModelMap.has(tag)) makeModelMap.set(tag, new Set());
        } else if (tag.startsWith("make:")) {
          const m = tag.replace("make:", "").trim();
          if (m.length > 0 && knownMakes.has(m)) {
            foundMakes.add(m);
            productMakes.add(m);
            if (!makeModelMap.has(m)) makeModelMap.set(m, new Set());
          }
        }
      }

      // Models: ONLY tags with "model:" prefix
      if (productMakes.size > 0) {
        for (const tag of tags) {
          if (tag.startsWith("model:")) {
            const model = tag.replace("model:", "").trim();
            if (model.length > 0 && model.length <= 25) {
              for (const make of productMakes) {
                makeModelMap.get(make)!.add(model);
              }
            }
          }
        }
      }
    }

    const ymmMakes = Array.from(foundMakes).sort();
    const ymmYears = Array.from(foundYears).sort((a, b) => parseInt(b) - parseInt(a));
    const ymmModels: Record<string, string[]> = {};
    for (const [make, models] of makeModelMap) {
      ymmModels[make] = Array.from(models).sort();
    }

    await supabase.from("ymm_config" as any).upsert({
      id: 1,
      makes: ymmMakes,
      models: ymmModels,
      years: ymmYears,
      make_collection_map: makeCollectionMap,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    console.log(`YMM config built: ${ymmMakes.length} makes, ${ymmYears.length} years`);

    // Mark sync as completed
    await updateSyncStatus({
      status: "completed",
      progress: allProducts.length,
      total: allProducts.length,
      completed_at: new Date().toISOString(),
    });

    console.log(`Sync complete: ${synced} products, ${alerts.length} alerts`);

    return new Response(
      JSON.stringify({ success: true, synced, total: allProducts.length, alerts: alerts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync-shopify-products error:", err);
    await updateSyncStatus({
      status: "failed",
      error_message: err.message,
      completed_at: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
