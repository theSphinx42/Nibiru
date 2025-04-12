import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

// Disable Next.js body parsing, we need the raw body for Stripe webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Get the raw body for signature verification
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      // Add more event handlers as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle completed checkout sessions
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerId = session.customer as string;
    const userId = session.metadata?.userId;
    const productType = session.metadata?.productType;

    if (!userId) {
      console.error('No userId in session metadata:', session.id);
      return;
    }

    // Mock user update - in a real app, this would update the database
    console.log(`Updating user ${userId} for ${productType} purchase`);

    // Switch based on product type to handle different updates
    switch (productType) {
      case 'seller_onboarding':
        // Update user to seller role and store Stripe customer ID
        await mockUpdateUser(userId, {
          hasPaidOnboardingFee: true,
          role: 'seller',
          stripeCustomerId: customerId
        });
        break;
      
      case 'newsletter':
        // Mark user as newsletter subscriber
        await mockUpdateUser(userId, {
          isNewsletterSubscriber: true,
          stripeCustomerId: customerId
        });
        break;
      
      case 'galatea_access':
        // Grant access to Galatea project
        await mockUpdateUser(userId, {
          unlockedPremiumAccess: { galatea: true },
          stripeCustomerId: customerId
        });
        break;
      
      default:
        console.log(`Unknown product type: ${productType}`);
    }
  } catch (error) {
    console.error('Error processing checkout completion:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}

/**
 * Handle paid invoices (for subscriptions)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    // For subscriptions, invoices are generated periodically
    const customerId = invoice.customer as string;
    
    // Find customer to get user details
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      console.error('Customer was deleted:', customerId);
      return;
    }
    
    const userId = customer.metadata.userId;
    
    if (!userId) {
      console.error('No userId in customer metadata:', customerId);
      return;
    }
    
    // Update user subscription status
    console.log(`Updating subscription status for user ${userId}`);
    await mockUpdateUser(userId, { isNewsletterSubscriber: true });
    
    // TODO: In a real app, send welcome email for new subscriptions
  } catch (error) {
    console.error('Error processing paid invoice:', error);
    throw error;
  }
}

/**
 * Mock function to update user data
 * In a real application, this would update the database
 */
async function mockUpdateUser(userId: string, data: any) {
  // This is a mock function - in a real app, update your database
  console.log(`MOCK: Updating user ${userId} with data:`, data);
  
  // In a real app:
  // await db.users.update({ id: userId }, data);
  
  return true;
} 