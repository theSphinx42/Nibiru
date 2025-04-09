import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Transaction } from '../../../types/user';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Platform fee calculation (1% or $1 minimum)
function calculatePlatformFee(amount: number): number {
  const percentageFee = amount * 0.01; // 1%
  return Math.max(percentageFee, 100); // Minimum $1.00 (in cents)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { 
      buyerId, 
      sellerId, 
      listingId, 
      amount, 
      stripeToken,
      customerEmail,
      description
    } = req.body;

    // Validate required fields
    if (!buyerId || !sellerId || !listingId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate platform fee and seller payout
    const amountInCents = Math.round(amount * 100);
    const platformFeeInCents = calculatePlatformFee(amountInCents);
    const sellerPayoutInCents = amountInCents - platformFeeInCents;
    
    // Create a transaction record
    const transaction: Transaction = {
      id: `tr_${Math.random().toString(36).substring(2, 12)}`,
      buyerId,
      sellerId,
      listingId,
      amount: amountInCents / 100,
      platformFee: platformFeeInCents / 100,
      sellerPayout: sellerPayoutInCents / 100,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // MOCK: In a real app, this would be a database transaction
    console.log('Creating transaction:', transaction);
    
    // Process payment via Stripe
    try {
      // Mock payment for now - in a real app, use Stripe to process the payment
      console.log(`Processing payment of $${amount} with fee $${platformFeeInCents/100}`);
      
      // For demo purposes, we'll simulate a payment with Stripe
      // In a real app, you would use connected accounts for the seller
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        description: description || `Purchase of listing #${listingId}`,
        application_fee_amount: platformFeeInCents,
        metadata: {
          buyerId,
          sellerId,
          listingId,
          transactionId: transaction.id
        }
      });
      
      // Update transaction status
      transaction.status = 'completed';
      
      // MOCK: In a real app, update database with completed transaction
      console.log('Payment successful, transaction completed:', transaction);
      
      // Success
      return res.status(200).json({
        success: true,
        transaction,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret
        }
      });
    } catch (paymentError) {
      // Update transaction status
      transaction.status = 'failed';
      
      // MOCK: In a real app, update database with failed transaction
      console.error('Payment failed:', paymentError);
      
      // Payment failed
      return res.status(400).json({
        success: false,
        error: 'Payment processing failed',
        details: paymentError instanceof Error ? paymentError.message : 'Unknown error',
        transaction
      });
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Transaction processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 