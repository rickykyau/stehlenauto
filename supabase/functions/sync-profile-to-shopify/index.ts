const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { first_name, last_name, phone, email } = await req.json();
    const shopifyToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    const shopifyDomain = 'stehlenauto.myshopify.com';

    if (!shopifyToken || !email) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing config' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Find customer by email
    const searchRes = await fetch(`https://${shopifyDomain}/admin/api/2025-07/customers/search.json?query=email:${encodeURIComponent(email)}`, {
      headers: { 'X-Shopify-Access-Token': shopifyToken },
    });
    const searchData = await searchRes.json();
    const customers = searchData?.customers || [];

    if (customers.length === 0) {
      // Create customer
      await fetch(`https://${shopifyDomain}/admin/api/2025-07/customers.json`, {
        method: 'POST',
        headers: { 'X-Shopify-Access-Token': shopifyToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: { email, first_name, last_name, phone, verified_email: true } }),
      });
    } else {
      // Update customer
      const customerId = customers[0].id;
      await fetch(`https://${shopifyDomain}/admin/api/2025-07/customers/${customerId}.json`, {
        method: 'PUT',
        headers: { 'X-Shopify-Access-Token': shopifyToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: { id: customerId, first_name, last_name, phone } }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
