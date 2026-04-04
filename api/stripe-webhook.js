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
      body: JSON.stringify({
        has_test_access: hasTestAccess,
        is_premium: isPremium,
      }),
    });
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

  let event;

  try {
    // Verify the webhook came from Stripe
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;

    if (!customerEmail) {
      console.error('No customer email in session');
      return res.status(200).json({ received: true });
    }

    // Determine which plan was purchased by checking line items
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      let isPremium = false;
      let hasTestAccess = false;

      if (priceId === PREMIUM_PRICE_ID) {
        isPremium = true;
        hasTestAccess = true;
        console.log(`Activating PREMIUM for ${customerEmail}`);
      } else if (priceId === TEST_PRICE_ID) {
        hasTestAccess = true;
        console.log(`Activating TEST ACCESS for ${customerEmail}`);
      } else {
        // Unknown price -- grant test access as default
        hasTestAccess = true;
        console.log(`Unknown price ${priceId} -- granting test access to ${customerEmail}`);
      }

      await updateUserInSupabase(customerEmail, isPremium, hasTestAccess);
    } catch (e) {
      console.error('Error processing line items:', e.message);
    }
  }

  // Handle subscription updates (in case they upgrade/downgrade)
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    try {
      const customer = await stripe.customers.retrieve(subscription.customer);
      const email = customer.email;
      const priceId = subscription.items.data[0]?.price?.id;
      const isActive = subscription.status === 'active';

      if (!isActive) return res.status(200).json({ received: true });

      const isPremium = priceId === PREMIUM_PRICE_ID;
      const hasTestAccess = priceId === TEST_PRICE_ID || isPremium;

      await updateUserInSupabase(email, isPremium, hasTestAccess);
    } catch (e) {
      console.error('Subscription update error:', e.message);
    }
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    try {
      const customer = await stripe.customers.retrieve(subscription.customer);
      const email = customer.email;
      await updateUserInSupabase(email, false, false);
      console.log(`Subscription cancelled for ${email}`);
    } catch (e) {
      console.error('Cancellation error:', e.message);
    }
  }

  return res.status(200).json({ received: true });
};

// Helper to get raw request body (needed for Stripe signature verification)
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
