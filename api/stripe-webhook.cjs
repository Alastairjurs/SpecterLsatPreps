const SUPABASE_URL = 'https://lagoonrkbastofxkatox.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PREMIUM_PRICE_ID = 'price_1TF2BL3OTgrWIp2Pl94Yt01j';

async function updateUserInSupabase(email, isPremium, hasTestAccess) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ has_test_access: hasTestAccess, is_premium: isPremium }),
    });
    console.log(`Supabase update for ${email}: status ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error('Supabase error:', e.message);
    return false;
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel parses the body automatically - use req.body directly
    const event = req.body;

    if (!event || !event.type) {
      console.error('No event type found in body');
      return res.status(400).json({ error: 'Invalid event' });
    }

    console.log(`Event type: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      const customerEmail = session?.customer_details?.email || session?.customer_email;
      console.log(`Customer email: ${customerEmail}`);

      if (!customerEmail) {
        return res.status(200).json({ received: true, note: 'No email found' });
      }

      // Fetch line items to determine plan
      let isPremium = false;
      try {
        const liRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`, {
          headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` }
        });
        const liData = await liRes.json();
        const priceId = liData?.data?.[0]?.price?.id;
        console.log(`Price ID: ${priceId}`);
        isPremium = priceId === PREMIUM_PRICE_ID;
      } catch (e) {
        console.error('Line items fetch error:', e.message);
      }

      await updateUserInSupabase(customerEmail, isPremium, true);
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data?.object;
      const custRes = await fetch(`https://api.stripe.com/v1/customers/${sub.customer}`, {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` }
      });
      const cust = await custRes.json();
      const priceId = sub?.items?.data?.[0]?.price?.id;
      if (sub.status === 'active') {
        await updateUserInSupabase(cust.email, priceId === PREMIUM_PRICE_ID, true);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data?.object;
      const custRes = await fetch(`https://api.stripe.com/v1/customers/${sub.customer}`, {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` }
      });
      const cust = await custRes.json();
      await updateUserInSupabase(cust.email, false, false);
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('Handler error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

module.exports = handler;
