const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = 'https://lagoonrkbastofxkatox.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const TEST_PRICE_ID = 'price_1TF29Z3OTgrWIp2P7mavRtpM';
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

module.exports = async function handler(req, res) {
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

  let event;
  try {
    // Vercel provides req.body as a buffer when bodyParser is disabled
    const rawBody = req.body;
    if (!rawBody) {
      return res.status(400).json({ error: 'No body received' });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  console.log(`Received event: ${event.type}`);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      console.log(`Checkout completed for: ${customerEmail}`);

      if (!customerEmail) {
        return res.status(200).json({ received: true });
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      console.log(`Price ID: ${priceId}`);

      const isPremium = priceId === PREMIUM_PRICE_ID;
      const hasTestAccess = true; // all paying customers get test access

      await updateUserInSupabase(customerEmail, isPremium, hasTestAccess);
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const email = customer.email;
      const priceId = subscription.items.data[0]?.price?.id;
      const isActive = subscription.status === 'active';
      if (isActive) {
        const isPremium = priceId === PREMIUM_PRICE_ID;
        await updateUserInSupabase(email, isPremium, true);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      await updateUserInSupabase(customer.email, false, false);
    }
  } catch (e) {
    console.error('Event handling error:', e.message);
    return res.status(500).json({ error: e.message });
  }

  return res.status(200).json({ received: true });
};
