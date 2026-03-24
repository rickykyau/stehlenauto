import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = claimsData.claims.email as string;
    if (!userEmail) {
      return new Response(JSON.stringify({ error: "No email found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch orders from Shopify Admin API
    const shopUrl = Deno.env.get("SHOPIFY_STORE_URL")!.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const accessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN")!;

    const query = `{
      orders(first: 20, query: "email:${userEmail}", sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant { image { url } }
                }
              }
            }
          }
        }
      }
    }`;

    const shopifyRes = await fetch(`https://${shopUrl}/admin/api/2025-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!shopifyRes.ok) {
      const text = await shopifyRes.text();
      console.error("Shopify API error:", shopifyRes.status, text);
      return new Response(JSON.stringify({ error: "Failed to fetch orders" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shopifyData = await shopifyRes.json();

    if (shopifyData.errors) {
      console.error("Shopify GraphQL errors:", shopifyData.errors);
      return new Response(JSON.stringify({ error: "Shopify query failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orders = (shopifyData.data?.orders?.edges || []).map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        name: node.name,
        createdAt: node.createdAt,
        financialStatus: node.displayFinancialStatus,
        fulfillmentStatus: node.displayFulfillmentStatus,
        total: node.totalPriceSet?.shopMoney?.amount,
        currency: node.totalPriceSet?.shopMoney?.currencyCode,
        lineItems: (node.lineItems?.edges || []).map((li: any) => ({
          title: li.node.title,
          quantity: li.node.quantity,
          imageUrl: li.node.variant?.image?.url || null,
        })),
      };
    });

    return new Response(JSON.stringify({ orders }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
