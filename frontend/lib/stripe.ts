import { loadStripe, Stripe } from '@stripe/stripe-js';
import { GalateaAccessTier } from '../types/galatea';

// Load Stripe with public key
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

// Stripe Product and Price IDs
// These would be replaced with actual IDs from your Stripe dashboard in production
export const STRIPE_PRICE_IDS = {
  SELLER_ONBOARDING: 'price_seller_onboarding_fee',
  NEWSLETTER_SUBSCRIPTION: 'price_newsletter_subscription',
  GALATEA_ACCESS: 'price_galatea_access',
  GALATEA_GUARDIAN: 'price_galatea_guardian_tier'
};

// Galatea Price IDs
export const GALATEA_PRICE_IDS = {
  TRIAL_VISION: 'price_galatea_trial_vision',      // $20 single listing
  FORGE_UNLOCK: 'price_galatea_forge_unlock',      // $50 permanent unlock
  CREATOR_PASS: 'price_galatea_creator_pass',      // $42/month subscription
} as const;

// Galatea product metadata keys
export const GALATEA_METADATA_KEYS = {
  TIER: 'galatea_tier',
  LISTING_ID: 'galatea_listing_id',
  SELLER_ID: 'galatea_seller_id',
} as const;

// Stripe API settings
export const STRIPE_API_VERSION = '2023-10-16';

// Transaction types
export enum TransactionType {
  SELLER_ONBOARDING = 'seller_onboarding',
  NEWSLETTER_SUBSCRIPTION = 'newsletter_subscription',
  PREMIUM_ACCESS = 'premium_access',
  LISTING_PURCHASE = 'listing_purchase',
}

// Transaction statuses
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Platform fee calculation
export const calculatePlatformFee = (amount: number): number => {
  // 1% fee with $1 minimum
  return Math.max(amount * 0.01, 1);
};

// Currency formatting helper
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const getPriceDisplay = (amount: number): string => {
  if (amount === 0) {
    return 'Free';
  }
  return formatCurrency(amount);
};

// Stripe webhook events we care about
export const RELEVANT_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

// Maximum file size for uploads (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Product names for display
export const PRODUCT_NAMES = {
  SELLER_ONBOARDING: 'Seller Onboarding Fee',
  NEWSLETTER_SUBSCRIPTION: 'Developer Newsletter Subscription',
  GALATEA_ACCESS: 'Galatea AI Embodiment Project Access',
  GALATEA_GUARDIAN: 'Galatea Guardian Tier'
};

// Checkout options for different products
export const createCheckoutOptions = (
  priceId: string, 
  customerId?: string, 
  metadata: Record<string, string> = {}
) => {
  return {
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: priceId === STRIPE_PRICE_IDS.NEWSLETTER_SUBSCRIPTION ? 'subscription' : 'payment',
    successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/payment/canceled`,
    customerEmail: undefined, // Will be filled in by the API using the user's email
    clientReferenceId: undefined, // Will be filled in by the API using the user's ID
    customer: customerId,
    metadata
  };
};

// Helper to get Galatea checkout options
export const createGalateaCheckoutOptions = (
  tier: GalateaAccessTier,
  userId: string,
  metadata: Record<string, string> = {}
) => {
  let priceId: string;
  let mode: 'payment' | 'subscription';

  switch (tier) {
    case GalateaAccessTier.TRIAL:
      priceId = GALATEA_PRICE_IDS.TRIAL_VISION;
      mode = 'payment';
      break;
    case GalateaAccessTier.FORGE:
      priceId = GALATEA_PRICE_IDS.FORGE_UNLOCK;
      mode = 'payment';
      break;
    case GalateaAccessTier.CREATOR_PASS:
      priceId = GALATEA_PRICE_IDS.CREATOR_PASS;
      mode = 'subscription';
      break;
    default:
      throw new Error('Invalid Galatea tier');
  }

  return {
    lineItems: [{ price: priceId, quantity: 1 }],
    mode,
    successUrl: `${window.location.origin}/galatea/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/galatea/canceled`,
    clientReferenceId: userId,
    metadata: {
      ...metadata,
      [GALATEA_METADATA_KEYS.TIER]: tier,
    }
  };
}; 