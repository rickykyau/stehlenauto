const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { full_name, address_line_1, address_line_2, city, state, zip_code, country, email } = await req.json();
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

    if (customers.length > 0) {
      const customerId = customers[0].id;
      const nameParts = (full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await fetch(`https://${shopifyDomain}/admin/api/2025-07/customers/${customerId}/addresses.json`, {
        method: 'POST',
        headers: { 'X-Shopify-Access-Token': shopifyToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            first_name: firstName,
            last_name: lastName,
            address1: address_line_1,
            address2: address_line_2 || '',
            city,
            province: state,
            zip: zip_code,
            country: country || 'US',
          },
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
