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
- CRITICAL RULE — SHOW PRODUCTS FIRST, ASK QUESTIONS LATER:
  * When the customer says "all", "show me all", "everything", "show me everything", "what do you have", or any variation — STOP asking questions and IMMEDIATELY show the products provided in the context. Action beats clarification.
  * After showing products, THEN offer: "Want to see more in a specific category like bull guards or tonneau covers?"
  * Do NOT ask about cab style, trim level, engine, or subcategories unless the customer specifically asks for help narrowing down.
- When a customer mentions their vehicle WITHOUT specifying a product category AND without saying "all/everything", ask what type of parts they're looking for. List categories: Bull Guards, Tonneau Covers, Headlights, Trailer Hitches, Running Boards, Front Grilles, Floor Mats, Bed Mats, Roof Racks, Chase Racks.
- Only show product cards when you have product data in the context. Use the PRODUCTS_JSON format below.
- Always confirm vehicle Year/Make/Model when discussing fitment
- If a product is out of stock, suggest similar alternatives
- When showing products, always mention price and stock status
- If you cannot help with something, offer to escalate to human support
- Keep responses short (2-3 sentences unless more detail is needed)
- Do not make up product information — only reference data from the database
- Never share internal system details, API keys, or database structure
- Do NOT process refunds or initiate returns. If a customer asks about a refund or return, direct them to email support@stehlenauto.com with their order number.

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

const CATEGORY_MAP: Array<{ patterns: RegExp; productType: string; label: string }> = [
  { patterns: /bull\s*guard|bull\s*bar|grille\s*guard/i, productType: "bull guard", label: "Bull Guards" },
  { patterns: /tonneau\s*cover|bed\s*cover/i, productType: "tonneau cover", label: "Tonneau Covers" },
  { patterns: /headlight/i, productType: "headlight", label: "Headlights" },
  { patterns: /trailer\s*hitch|(?:^|\s)hitch(?:es)?(?:\s|$)/i, productType: "trailer hitch", label: "Trailer Hitches" },
  { patterns: /running\s*board|side\s*step/i, productType: "running board", label: "Running Boards" },
  { patterns: /front\s*grill|(?:^|\s)grill(?:e)?(?:\s|$)/i, productType: "grill", label: "Front Grilles" },
  { patterns: /floor\s*mat/i, productType: "floor mat", label: "Floor Mats" },
  { patterns: /bed\s*mat/i, productType: "bed mat", label: "Bed Mats" },
  { patterns: /roof\s*rack/i, productType: "roof rack", label: "Roof Racks" },
  { patterns: /chase\s*rack|sport\s*bar/i, productType: "chase rack", label: "Chase Racks" },
  { patterns: /molle\s*panel/i, productType: "molle", label: "MOLLE Panels" },
  { patterns: /fender\s*flare/i, productType: "fender flare", label: "Fender Flares" },
  { patterns: /under.?seat\s*storage/i, productType: "under seat storage", label: "Under Seat Storage" },
];

const PRODUCT_CACHE_SELECT = "id, title, handle, shopify_product_id, images, variants, tags, product_type, fitment_vehicles, metafields, cb_item_name, part_number, status";

function parseVehicle(message: string, vehicleContext: { year: string; make: string; model: string } | null) {
  const patterns = [
    /(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9][\w-]*(?:\s+\d+)?)/i,
    /(?:is\s+a|have\s+a|drive\s+a|own\s+a|got\s+a|my)\s+(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9][\w-]*(?:\s+\d+)?)/i,
  ];
  for (const re of patterns) {
    const m = message.match(re);
    if (m) return { year: m[1], make: m[2], model: m[3].trim() };
  }
  return vehicleContext ? { ...vehicleContext } : null;
}

// Extract vehicle from conversation history if not in current message
function parseVehicleFromHistory(history: Array<{ role: string; content: string }>): { year: string; make: string; model: string } | null {
  const patterns = [
    /(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9][\w-]*(?:\s+\d+)?)/i,
  ];
  // Search backwards through history (most recent first)
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role !== "user") continue;
    for (const re of patterns) {
      const m = msg.content.match(re);
      if (m) return { year: m[1], make: m[2], model: m[3].trim() };
    }
  }
  return null;
}

function detectCategory(message: string): { productType: string; label: string } | null {
  for (const cat of CATEGORY_MAP) {
    if (cat.patterns.test(message)) return { productType: cat.productType, label: cat.label };
  }
  return null;
}

function isShowAllIntent(message: string): boolean {
  return /\b(show\s*(me\s*)?(all|everything)|all\s*(products?|parts?|of\s*(them|it))?|everything|what\s*(do\s*)?you\s*have|show\s*products?|see\s*(all|everything)|list\s*(all|everything))\b/i.test(message);
}

function normalizeVehicleValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toTagCase(value: string): string {
  return normalizeVehicleValue(value)
    .split(" ")
    .map((part) => {
      if (!part) return part;
      if (/^[A-Z0-9-]+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function buildModelVariants(model: string): string[] {
  const normalized = normalizeVehicleValue(model);
  const compact = normalized.replace(/[\s-]/g, "");
  const hyphenated = normalized.replace(/\s+/g, "-");
  const spaced = normalized.replace(/-/g, " ");
  const upper = hyphenated.toUpperCase();

  return Array.from(new Set([normalized, hyphenated, spaced, compact, upper].filter(Boolean)));
}

function escapeArrayValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function escapeIlikeValue(value: string): string {
  return normalizeVehicleValue(value).replace(/[%*,]/g, " ").trim();
}

function applyVehicleSqlFilter(query: any, vehicle: { make: string; model: string } | null) {
  if (!vehicle?.make || !vehicle?.model) return query;

  const makeFilter = toTagCase(vehicle.make);
  const modelVariants = buildModelVariants(vehicle.model);
  const sqlOrParts = [
    ...modelVariants.map((variant) => `tags.cs.{${escapeArrayValue(variant)}}`),
    ...modelVariants.map((variant) => `title.ilike.%${escapeIlikeValue(makeFilter)}%${escapeIlikeValue(variant)}%`),
    ...modelVariants.map((variant) => `title.ilike.%${escapeIlikeValue(variant)}%`),
  ];

  return query.contains("tags", [makeFilter]).or(sqlOrParts.join(","));
}

function matchesVehicle(tags: string[], make: string, model: string, year?: string): boolean {
  const tagsLower = tags.map(t => t.toLowerCase());
  const makeLower = make.toLowerCase();
  const modelNorm = model.replace(/\s+/g, "-").toLowerCase();
  const modelAlt = model.replace(/-/g, "").toLowerCase();
  const modelSpaced = model.replace(/-/g, " ").toLowerCase();

  const isUniversal = tagsLower.some(t => t.includes("universal"));
  if (isUniversal) return true;

  const makeMatch = tagsLower.some(t => t === `make:${makeLower}` || t === makeLower);
  const modelMatch = tagsLower.some(t => {
    const tNorm = t.replace(/\s+/g, "-");
    const tAlt = t.replace(/-/g, "");
    return t === `model:${modelNorm}` || tNorm === `model:${modelNorm}` ||
      t === `model:${modelAlt}` || tAlt === `model:${modelAlt}` ||
      t === `model:${modelSpaced}` || tNorm.includes(modelNorm) || tAlt.includes(modelAlt);
  });

  if (!makeMatch || !modelMatch) return false;

  if (year) {
    const yearMatch = tagsLower.some(t => t === `year:${year}` || t === year);
    if (!yearMatch) {
      return true; // Allow through - year range matching is fuzzy
    }
  }
  return true;
}

function matchesCategory(product: any, categoryType: string): boolean {
  const pt = (product.product_type || "").toLowerCase();
  const title = (product.title || "").toLowerCase();
  const tagsStr = (product.tags || []).join(" ").toLowerCase();
  const cat = categoryType.toLowerCase();
  return pt.includes(cat) || title.includes(cat) || tagsStr.includes(cat);
}

function buildProductCard(p: any) {
  // Parse images — could be JSON string or array
  let images: any[] = [];
  try {
    images = typeof p.images === "string" ? JSON.parse(p.images) : Array.isArray(p.images) ? p.images : [];
  } catch { images = []; }

  // Extract first image URL — handle multiple formats
  let firstImage = "";
  if (images.length > 0) {
    const img = images[0];
    firstImage = img?.src || img?.url || img?.node?.url || (typeof img === "string" ? img : "");
  }

  // Parse variants — could be JSON string or array
  let variants: any[] = [];
  try {
    variants = typeof p.variants === "string" ? JSON.parse(p.variants) : Array.isArray(p.variants) ? p.variants : [];
  } catch { variants = []; }

  const firstVariant = variants[0] || {};

  // Extract price — handle string, number, or {amount} object
  let rawPrice = firstVariant.price;
  if (rawPrice && typeof rawPrice === "object" && rawPrice.amount) {
    rawPrice = rawPrice.amount;
  }
  const price = rawPrice ? String(rawPrice) : "0.00";

  const inStock = firstVariant.inventory_quantity > 0 || firstVariant.available !== false;

  // Use handle from DB, or generate from title as fallback
  const handle = p.handle || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    id: p.shopify_product_id,
    cacheId: p.id,
    title: p.title,
    price,
    image: firstImage,
    handle,
    inStock,
    variantId: firstVariant.id ? String(firstVariant.id) : "",
    inventoryQuantity: firstVariant.inventory_quantity ?? 0,
    partNumber: p.part_number,
    cbItemName: p.cb_item_name,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

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

    // 3. Gather user context
    let contextParts: string[] = [];
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

    // 4. Detect intent
    let parsedVehicle = parseVehicle(message, vehicleContext);
    // If no vehicle in current message or context, check conversation history
    if (!parsedVehicle) {
      parsedVehicle = parseVehicleFromHistory(conversationHistory || []);
    }
    const detectedCategory = detectCategory(message);
    const showAll = isShowAllIntent(message);

    const needsProductSearch =
      showAll || detectedCategory != null ||
      /(?:part|product|bull ?guard|bull ?bar|grille|tonneau|headlight|hitch|running board|fender|side step|roof rack|chase rack|floor mat|bed mat|molle|storage|find|search|looking for|recommend|suggest|show me|what do you have|fits? my|compatible|work with|in stock|available|front grill)/i.test(message);

    let productContext = "";
    let productsForResponse: any[] = [];

    if (needsProductSearch) {
      // "Show all" for a vehicle — search ALL categories
      if (parsedVehicle && (showAll || (!detectedCategory && showAll))) {
        let productsQuery = supabase
          .from("products_cache")
          .select(PRODUCT_CACHE_SELECT)
          .eq("status", "active");

        productsQuery = applyVehicleSqlFilter(productsQuery, parsedVehicle);

        const { data: products } = await productsQuery.limit(50);

        if (products?.length) {
          const vehicleMatched = products.filter((p: any) => {
            const tags = p.tags || [];
            return matchesVehicle(tags, parsedVehicle.make, parsedVehicle.model, parsedVehicle.year);
          });

          // Sort by inventory quantity descending (in-stock first)
          vehicleMatched.sort((a: any, b: any) => {
            const aQty = (Array.isArray(a.variants) ? a.variants : [])[0]?.inventory_quantity ?? 0;
            const bQty = (Array.isArray(b.variants) ? b.variants : [])[0]?.inventory_quantity ?? 0;
            return bQty - aQty;
          });

          const finalProducts = vehicleMatched.slice(0, 8);

          if (finalProducts.length > 0) {
            productsForResponse = finalProducts.map(buildProductCard);
            productContext = `\n\nShowing ALL products matching ${parsedVehicle.year || ""} ${parsedVehicle.make} ${parsedVehicle.model} (sorted by availability, top ${finalProducts.length}):\n${JSON.stringify(productsForResponse, null, 2)}\n\nIMPORTANT: Show these products immediately. Do NOT ask any more questions. After showing them, offer: "Want to see more in a specific category like bull guards or tonneau covers?"`;
          } else {
            // Broaden: search by make+model only, ignoring year
            const broadMatched = products.filter((p: any) => {
              const tags = p.tags || [];
              return matchesVehicle(tags, parsedVehicle.make, parsedVehicle.model);
            });
            broadMatched.sort((a: any, b: any) => {
              const aQty = (Array.isArray(a.variants) ? a.variants : [])[0]?.inventory_quantity ?? 0;
              const bQty = (Array.isArray(b.variants) ? b.variants : [])[0]?.inventory_quantity ?? 0;
              return bQty - aQty;
            });
            const broadFinal = broadMatched.slice(0, 8);
            if (broadFinal.length > 0) {
              productsForResponse = broadFinal.map(buildProductCard);
              productContext = `\n\nNo exact ${parsedVehicle.year} matches, but these products fit the ${parsedVehicle.make} ${parsedVehicle.model} (may cover your year via year-range fitment):\n${JSON.stringify(productsForResponse, null, 2)}\n\nShow these immediately. Note that while we don't have year-specific listings for ${parsedVehicle.year}, many of these cover it via year ranges like "2015+" or "2020-2025".`;
            } else {
              productContext = `\n\nNo products found for ${parsedVehicle.year || ""} ${parsedVehicle.make} ${parsedVehicle.model}. Tell the customer honestly and suggest browsing our full catalog.`;
            }
          }
        }
      }
      // Vehicle mentioned but NO category and NOT "show all" — ask for category
      else if (parsedVehicle && !detectedCategory && !showAll) {
        productContext = `\n\nThe customer mentioned their vehicle (${parsedVehicle.year || ""} ${parsedVehicle.make} ${parsedVehicle.model}) but did NOT specify a product category. Do NOT show any products. Instead, ask what type of parts they're looking for and list these categories: Bull Guards/Grille Guards, Tonneau Covers, Headlights, Trailer Hitches, Running Boards/Side Steps, Front Grilles, Floor Mats, Bed Mats, Roof Racks, Chase Racks/Sport Bars, MOLLE Panels, Fender Flares, Under Seat Storage. Also mention they can say "show me all" to see everything for their vehicle.`;
      }
      // Have a category — search with category filter
      else if (detectedCategory) {
        let productsQuery = supabase
          .from("products_cache")
          .select(PRODUCT_CACHE_SELECT)
          .eq("status", "active")
          .ilike("product_type", `%${detectedCategory.productType}%`);

        if (parsedVehicle) {
          productsQuery = applyVehicleSqlFilter(productsQuery, parsedVehicle);
        }

        const { data: products } = await productsQuery.limit(50);

        if (products?.length) {
          const categoryFiltered = products.filter((p: any) => matchesCategory(p, detectedCategory.productType));
          let finalProducts: any[] = [];
          let isExactMatch = true;

          if (parsedVehicle) {
            const vehicleMatched = categoryFiltered.filter((p: any) => {
              const tags = p.tags || [];
              return matchesVehicle(tags, parsedVehicle.make, parsedVehicle.model, parsedVehicle.year);
            });

            if (vehicleMatched.length > 0) {
              if (parsedVehicle.year) {
                vehicleMatched.sort((a: any, b: any) => {
                  const aYear = (a.tags || []).some((t: string) => t.toLowerCase() === `year:${parsedVehicle.year}` || t === parsedVehicle.year);
                  const bYear = (b.tags || []).some((t: string) => t.toLowerCase() === `year:${parsedVehicle.year}` || t === parsedVehicle.year);
                  return (bYear ? 1 : 0) - (aYear ? 1 : 0);
                });
              }
              finalProducts = vehicleMatched.slice(0, 4);
            } else {
              isExactMatch = false;
              finalProducts = categoryFiltered.slice(0, 4);
            }
          } else {
            finalProducts = categoryFiltered.slice(0, 4);
          }

          if (finalProducts.length > 0) {
            productsForResponse = finalProducts.map(buildProductCard);
            if (!isExactMatch && parsedVehicle) {
              productContext = `\n\nNo exact ${detectedCategory.label} found for ${parsedVehicle.year || ""} ${parsedVehicle.make} ${parsedVehicle.model}. These are our ${detectedCategory.label} but may NOT fit this specific vehicle:\n${JSON.stringify(productsForResponse, null, 2)}\n\nIMPORTANT: Tell the customer "We don't currently have ${detectedCategory.label} that fits your ${parsedVehicle.year || ""} ${parsedVehicle.make} ${parsedVehicle.model}. Would you like to see our full ${detectedCategory.label} selection or try a different part type?" and show the products with a clear note they may not fit.`;
            } else {
              productContext = `\n\nProduct search results (matching${parsedVehicle ? ` ${parsedVehicle.year || ""} ${parsedVehicle.make} ${parsedVehicle.model} +` : ""} ${detectedCategory.label}):\n${JSON.stringify(productsForResponse, null, 2)}`;
            }
          } else {
            productContext = `\n\nNo ${detectedCategory.label} products found${parsedVehicle ? ` for ${parsedVehicle.year || ""} ${parsedVehicle.make} ${parsedVehicle.model}` : ""}. Tell the customer honestly and ask if they'd like to try a different category.`;
          }
        }
      }
      // "Show all" without a vehicle — show popular products
      else if (showAll && !parsedVehicle) {
        const { data: products } = await supabase
          .from("products_cache")
          .select("id, title, handle, shopify_product_id, images, variants, tags, product_type, cb_item_name, part_number, status")
          .eq("status", "active")
          .limit(200);

        if (products?.length) {
          products.sort((a: any, b: any) => {
            const aQty = (Array.isArray(a.variants) ? a.variants : [])[0]?.inventory_quantity ?? 0;
            const bQty = (Array.isArray(b.variants) ? b.variants : [])[0]?.inventory_quantity ?? 0;
            return bQty - aQty;
          });
          productsForResponse = products.slice(0, 8).map(buildProductCard);
          productContext = `\n\nShowing top products sorted by availability:\n${JSON.stringify(productsForResponse, null, 2)}\n\nShow these immediately. Ask if they want to filter by vehicle or category.`;
        }
      }
      // Generic keyword search
      else {
        const keywords = message.toLowerCase().split(/\s+/).filter(
          (w: string) => w.length > 2 && !["the", "for", "and", "you", "have", "any", "can", "get", "what", "does", "this", "that", "with", "fit", "fits", "will", "need", "want", "like", "are", "there", "show", "find", "parts", "part", "looking"].includes(w)
        );
        if (keywords.length > 0) {
          const { data: products } = await supabase
            .from("products_cache")
            .select("id, title, handle, shopify_product_id, images, variants, tags, product_type, cb_item_name, part_number, status")
            .eq("status", "active")
            .limit(200);

          if (products?.length) {
            const matched = products.filter((p: any) => {
              const searchable = `${p.title} ${p.product_type || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
              return keywords.some((kw: string) => searchable.includes(kw));
            }).slice(0, 4);
            if (matched.length > 0) {
              productsForResponse = matched.map(buildProductCard);
              productContext = `\n\nKeyword search results:\n${JSON.stringify(productsForResponse, null, 2)}`;
            }
          }
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
    if (/order|track|shipping|where.*(my|is)|status/i.test(message.toLowerCase()) && userId) {
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

    const productsMatch = aiResponse.match(/\[PRODUCTS_JSON\]\s*([\s\S]*?)\s*\[\/PRODUCTS_JSON\]/);
    if (productsMatch) {
      try {
        responseProducts = JSON.parse(productsMatch[1]);
      } catch { /* ignore */ }
    }
    // Always strip PRODUCTS_JSON tags from response text
    cleanResponse = cleanResponse.replace(/\[PRODUCTS_JSON\][\s\S]*?\[\/PRODUCTS_JSON\]/g, "").trim();
    // Also strip partial/malformed tags
    cleanResponse = cleanResponse.replace(/\[PRODUCTS_JSON\][\s\S]*/g, "").trim();
    cleanResponse = cleanResponse.replace(/\[\/PRODUCTS_JSON\]/g, "").trim();

    // If Claude didn't include products but we found some, include them
    if (responseProducts.length === 0 && productsForResponse.length > 0) {
      responseProducts = productsForResponse;
    }

    const actionMatch = aiResponse.match(/\[ACTION_JSON\]\s*([\s\S]*?)\s*\[\/ACTION_JSON\]/);
    if (actionMatch) {
      try {
        responseAction = JSON.parse(actionMatch[1]);
      } catch { /* ignore */ }
    }
    // Always strip ACTION_JSON tags from response text
    cleanResponse = cleanResponse.replace(/\[ACTION_JSON\][\s\S]*?\[\/ACTION_JSON\]/g, "").trim();
    cleanResponse = cleanResponse.replace(/\[ACTION_JSON\][\s\S]*/g, "").trim();
    cleanResponse = cleanResponse.replace(/\[\/ACTION_JSON\]/g, "").trim();

    // Handle escalation
    if (responseAction?.type === "escalate" && convId) {
      await supabase.from("support_tickets").insert({
        user_id: userId,
        conversation_id: convId,
        subject: responseAction.data?.subject || "Customer support request",
        description: responseAction.data?.description || message,
        status: "open",
        priority: "medium",
      });
      await supabase.from("chat_conversations").update({ status: "escalated" }).eq("id", convId);
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

      const msgCount = (conversationHistory?.length || 0) + 2;
      await supabase.from("chat_conversations").update({
        message_count: msgCount,
        total_tokens: tokensUsed,
      }).eq("id", convId);
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
