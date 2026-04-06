const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = 'https://lagoonrkbastofxkatox.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

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
    console.log(`Supabase update for ${email}: ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error('Supabase update error:', e.message);
    return false;
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY not set');
    return res.status(500).json({ error: 'Stripe key not configured' });
  }

  // Collect raw body chunks for Stripe signature verification
  let rawBody = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk => { rawBody += chunk.toString(); });
    req.on('end', resolve);
    req.on('error', reject);
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  console.log(`Processing event: ${event.type}`);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      console.log(`Customer email: ${customerEmail}`);

      if (customerEmail) {
        let isPremium = false;
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const priceId = lineItems.data[0]?.price?.id;
          console.log(`Price ID: ${priceId}`);
          isPremium = priceId === PREMIUM_PRICE_ID;
        } catch (e) {
          console.error('Could not fetch line items:', e.message);
          isPremium = false;
        }
        await updateUserInSupabase(customerEmail, isPremium, true);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      try {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const priceId = subscription.items.data[0]?.price?.id;
        if (subscription.status === 'active') {
          await updateUserInSupabase(customer.email, priceId === PREMIUM_PRICE_ID, true);
        }
      } catch (e) {
        console.error('subscription.updated error:', e.message);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      try {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        await updateUserInSupabase(customer.email, false, false);
      } catch (e) {
        console.error('subscription.deleted error:', e.message);
      }
    }
  } catch (e) {
    console.error('Handler error:', e.message);
    // Still return 200 so Stripe doesn't keep retrying for non-critical errors
    return res.status(200).json({ received: true, warning: e.message });
  }

  return res.status(200).json({ received: true });
}

// CommonJS export with config for body parser
handler.config = { api: { bodyParser: false } };
module.exports = handler;
