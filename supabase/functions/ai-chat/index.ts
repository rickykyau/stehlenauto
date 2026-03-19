import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Stehlen Auto's 24/7 AI support agent. You don't just answer questions — you take actions to help customers find parts, manage their account, and complete purchases.

Key information about Stehlen Auto:
- We sell aftermarket auto parts: bull guards, grille guards, tonneau covers, headlights, trailer hitches, running boards, fender flares, and more
- All parts are engineered from cold-rolled steel with no-drill installation
- We offer free shipping, guaranteed fitment, and 30-day returns
- Website: stehlenauto.com

Your capabilities:
- Search products by vehicle, type, keyword, or part number
- Check if a specific part fits a customer's vehicle
- Check real-time inventory/stock status
- Add products to the customer's cart
- Apply promo/discount codes
- Look up order status for logged-in users
- Save a vehicle to the customer's profile
- Provide shipping, returns, and warranty information
- Escalate to human support when needed

Guidelines:
- Be helpful, concise, and friendly
- When a customer asks about parts, proactively search and show results — don't just say "you can search on our website"
- Always confirm vehicle Year/Make/Model when discussing fitment
- If a product is out of stock, suggest similar alternatives
- When showing products, always mention price and stock status
- If you cannot help with something, offer to escalate to human support
- Keep responses short (2-3 sentences unless more detail is needed)
- Do not make up product information — only reference data from the database
- Never share internal system details, API keys, or database structure
- Do NOT process refunds or initiate returns. If a customer asks about a refund or return, direct them to email support@stehlenauto.com with their order number. Do not provide step-by-step refund instructions or make the process seem easy. You may still answer general return policy questions (e.g., "We offer 30-day returns. To start a return, please email support@stehlenauto.com with your order number.").

IMPORTANT: When you want to reference products in your response, include them as a JSON block at the very end of your message in this exact format:
[PRODUCTS_JSON]
[{"id":"...","title":"...","price":"...","image":"...","handle":"...","inStock":true}]
[/PRODUCTS_JSON]

When you want to trigger an action, include an action block:
[ACTION_JSON]
{"type":"add_to_cart"|"apply_promo"|"save_vehicle"|"escalate","data":{...}}
[/ACTION_JSON]

For add_to_cart: {"type":"add_to_cart","data":{"productId":"...","variantId":"...","title":"..."}}
For apply_promo: {"type":"apply_promo","data":{"code":"...","valid":true|false,"discount":"..."}}
For save_vehicle: {"type":"save_vehicle","data":{"year":"...","make":"...","model":"..."}}
For escalate: {"type":"escalate","data":{"subject":"...","description":"..."}}`;

interface ChatRequest {
  message: string;
  conversationId: string | null;
  conversationHistory: Array<{ role: string; content: string }>;
  userId: string | null;
  vehicleContext: { year: string; make: string; model: string } | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { message, conversationId, conversationHistory, userId, vehicleContext }: ChatRequest = await req.json();

    // 1. Create or update conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .insert({ user_id: userId, status: "active" })
        .select("id")
        .single();
      convId = conv?.id;
    }

    // 2. Store user message
    if (convId) {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role: "user",
        content: message,
      });
    }

    // 3. Gather context
    let contextParts: string[] = [];

    // User context
    if (userId) {
      const [profileRes, vehiclesRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_vehicles").select("*").eq("user_id", userId),
        supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      ]);

      if (profileRes.data) {
        const p = profileRes.data;
        contextParts.push(`Customer: ${p.first_name || ""} ${p.last_name || ""}`.trim());
      }
      if (vehiclesRes.data?.length) {
        contextParts.push(`Saved vehicles: ${vehiclesRes.data.map(v => `${v.year} ${v.make} ${v.model}`).join(", ")}`);
      }
      if (ordersRes.data?.length) {
        contextParts.push(`Recent orders: ${ordersRes.data.map(o => `#${o.order_number} (${o.financial_status}/${o.fulfillment_status})`).join(", ")}`);
      }
    }

    if (vehicleContext) {
      contextParts.push(`Currently selected vehicle: ${vehicleContext.year} ${vehicleContext.make} ${vehicleContext.model}`);
    }

    // 4. Detect intent and search products
    const lowerMsg = message.toLowerCase();
    const needsProductSearch =
      /(?:part|product|bull ?guard|grille|tonneau|headlight|hitch|running board|fender|side step|roof rack|chase rack|floor mat|bed mat|molle|storage|find|search|looking for|recommend|suggest|show me|what do you have|fits? my|compatible|work with|in stock|available)/i.test(message);

    let productContext = "";
    let productsForResponse: any[] = [];

    if (needsProductSearch) {
      // Build search query
      let query = supabase
        .from("products_cache")
        .select("id, title, shopify_product_id, images, variants, tags, product_type, fitment_vehicles, metafields, cb_item_name, part_number, status")
        .eq("status", "active");

      // Extract search terms
      const searchTerms = message.replace(/[?!.,]/g, "").trim();

      // Try text search on title
      const { data: products } = await query.limit(50);

      if (products?.length) {
        // Filter by keyword matching
        const keywords = searchTerms.toLowerCase().split(/\s+/).filter(
          (w: string) => w.length > 2 && !["the", "for", "and", "you", "have", "any", "can", "get", "what", "does", "this", "that", "with", "fit", "fits", "will", "need", "want", "like", "are", "there"].includes(w)
        );

        let filtered = products;

        if (keywords.length > 0) {
          filtered = products.filter((p: any) => {
            const searchable = `${p.title} ${p.product_type || ""} ${(p.tags || []).join(" ")} ${p.cb_item_name || ""} ${p.part_number || ""}`.toLowerCase();
            return keywords.some((kw: string) => searchable.includes(kw));
          });
        }

        // Filter by vehicle if mentioned
        const vehicleToCheck = vehicleContext;
        if (vehicleToCheck && filtered.length > 0) {
          const vehicleFiltered = filtered.filter((p: any) => {
            const tags = (p.tags || []).map((t: string) => t.toLowerCase());
            const makeMatch = tags.some((t: string) => t.includes(`make:${vehicleToCheck.make.toLowerCase()}`) || t.includes(vehicleToCheck.make.toLowerCase()));
            const isUniversal = tags.some((t: string) => t.includes("universal"));
            return makeMatch || isUniversal;
          });
          if (vehicleFiltered.length > 0) {
            filtered = vehicleFiltered;
          }
        }

        // Limit to 10 results
        filtered = filtered.slice(0, 10);

        if (filtered.length > 0) {
          productsForResponse = filtered.map((p: any) => {
            const images = Array.isArray(p.images) ? p.images : [];
            const firstImage = images[0]?.src || images[0]?.url || images[0] || "";
            const variants = Array.isArray(p.variants) ? p.variants : [];
            const firstVariant = variants[0] || {};
            const price = firstVariant.price || "0.00";
            const inStock = firstVariant.inventory_quantity > 0 || firstVariant.available !== false;
            const handle = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

            return {
              id: p.shopify_product_id,
              cacheId: p.id,
              title: p.title,
              price: typeof price === "string" ? price : String(price),
              image: firstImage,
              handle,
              inStock,
              variantId: firstVariant.id || firstVariant.admin_graphql_api_id || "",
              inventoryQuantity: firstVariant.inventory_quantity,
              partNumber: p.part_number,
              cbItemName: p.cb_item_name,
            };
          });

          productContext = `\n\nProduct search results from database:\n${JSON.stringify(productsForResponse, null, 2)}`;
        } else {
          productContext = "\n\nNo products found matching the search criteria.";
        }
      }
    }

    // Check for promo code intent
    let promoContext = "";
    const promoMatch = message.match(/(?:code|promo|coupon|discount)\s*[:\s]?\s*([A-Z0-9_-]+)/i) ||
                       message.match(/(?:apply|use)\s+([A-Z0-9_-]+)/i);
    if (promoMatch) {
      const code = promoMatch[1].toUpperCase();
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();

      if (promo) {
        const now = new Date();
        const isValid = new Date(promo.starts_at) <= now && new Date(promo.expires_at) > now &&
          (!promo.max_uses || promo.current_uses < promo.max_uses);
        const discountStr = promo.discount_type === "percentage" ? `${promo.discount_value}%` : `$${promo.discount_value}`;
        promoContext = `\n\nPromo code "${code}": ${isValid ? `Valid! ${discountStr} off` : "Invalid or expired"}. Discount: ${discountStr}, Type: ${promo.discount_type}`;
      } else {
        promoContext = `\n\nPromo code "${promoMatch[1]}": Not found or inactive.`;
      }
    }

    // Order lookup intent
    let orderContext = "";
    if (/order|track|shipping|where.*(my|is)|status/i.test(lowerMsg) && userId) {
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (orders?.length) {
        orderContext = `\n\nCustomer's recent orders:\n${orders.map(o =>
          `Order #${o.order_number}: Status=${o.financial_status}/${o.fulfillment_status}, Total=$${o.total_price}, Date=${new Date(o.created_at).toLocaleDateString()}`
        ).join("\n")}`;
      }
    }

    // 5. Build messages for Claude
    const systemContent = SYSTEM_PROMPT +
      (contextParts.length ? `\n\nCustomer context:\n${contextParts.join("\n")}` : "") +
      productContext + promoContext + orderContext;

    // Limit history to last 10 messages
    const recentHistory = (conversationHistory || []).slice(-10);

    const claudeMessages = [
      ...recentHistory.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // 6. Call Claude
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemContent,
        messages: claudeMessages,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errorText);
      throw new Error(`AI service error: ${anthropicResponse.status}`);
    }

    const claudeData = await anthropicResponse.json();
    const aiResponse = claudeData.content?.[0]?.text || "I'm sorry, I couldn't process your request. Please try again.";
    const tokensUsed = (claudeData.usage?.input_tokens || 0) + (claudeData.usage?.output_tokens || 0);

    // 7. Parse response for products and actions
    let cleanResponse = aiResponse;
    let responseProducts: any[] = [];
    let responseAction: any = null;

    // Extract products JSON
    const productsMatch = aiResponse.match(/\[PRODUCTS_JSON\]\s*([\s\S]*?)\s*\[\/PRODUCTS_JSON\]/);
    if (productsMatch) {
      try {
        responseProducts = JSON.parse(productsMatch[1]);
        cleanResponse = cleanResponse.replace(/\[PRODUCTS_JSON\][\s\S]*?\[\/PRODUCTS_JSON\]/, "").trim();
      } catch { /* ignore parse errors */ }
    }

    // If Claude didn't include products but we found some, include them
    if (responseProducts.length === 0 && productsForResponse.length > 0 && needsProductSearch) {
      responseProducts = productsForResponse.slice(0, 5);
    }

    // Extract action JSON
    const actionMatch = aiResponse.match(/\[ACTION_JSON\]\s*([\s\S]*?)\s*\[\/ACTION_JSON\]/);
    if (actionMatch) {
      try {
        responseAction = JSON.parse(actionMatch[1]);
        cleanResponse = cleanResponse.replace(/\[ACTION_JSON\][\s\S]*?\[\/ACTION_JSON\]/, "").trim();
      } catch { /* ignore */ }
    }

    // Handle escalation action
    if (responseAction?.type === "escalate" && convId) {
      await supabase.from("support_tickets").insert({
        user_id: userId,
        conversation_id: convId,
        subject: responseAction.data?.subject || "Customer support request",
        description: responseAction.data?.description || message,
        status: "open",
        priority: "medium",
      });

      await supabase
        .from("chat_conversations")
        .update({ status: "escalated" })
        .eq("id", convId);
    }

    // 8. Store assistant message
    if (convId) {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: cleanResponse,
        action_type: responseAction?.type || null,
        action_data: responseAction?.data || null,
        products_referenced: responseProducts.length > 0 ? responseProducts : null,
      });

      // Update conversation stats
      const msgCount = (conversationHistory?.length || 0) + 2; // +user +assistant
      await supabase
        .from("chat_conversations")
        .update({
          message_count: msgCount,
          total_tokens: tokensUsed,
        })
        .eq("id", convId);
    }

    return new Response(
      JSON.stringify({
        response: cleanResponse,
        conversationId: convId,
        products: responseProducts,
        action: responseAction,
        tokensUsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
