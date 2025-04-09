import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { STRIPE_PRICE_IDS } from '../../../lib/stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      priceId,
      customerId,
      customerEmail = 'demo@example.com', // In a real app, get this from auth session
      userId = 'user_123',                // In a real app, get this from auth session
      productType,
      metadata = {}
    } = req.body;

    // Validate the price ID
    if (!priceId || !Object.values(STRIPE_PRICE_IDS).includes(priceId)) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    // Determine checkout mode based on product type
    const mode = productType === 'subscription' ? 'subscription' : 'payment';

    // Create Stripe customer if not exists
    let customerForSession = customerId;
    if (!customerId && customerEmail) {
      // Check if customer already exists
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      
      if (customers.data.length > 0) {
        customerForSession = customers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { userId }
        });
        customerForSession = customer.id;
      }
    }

    // Prepare session parameters
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&product_type=${productType}`,
      cancel_url: `${req.headers.origin}/payment/canceled`,
      metadata: {
        userId,
        productType,
        ...metadata
      }
    };
    
    // Add customer info if available
    if (customerForSession) {
      params.customer = customerForSession;
    } else if (customerEmail) {
      params.customer_email = customerEmail;
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(params);

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 