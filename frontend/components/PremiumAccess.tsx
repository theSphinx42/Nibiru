import { useState } from 'react';
import { FiLock, FiUnlock, FiCheckCircle, FiZap } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { STRIPE_PRICE_IDS } from '../lib/stripe';
import { toast } from 'react-hot-toast';

interface PremiumAccessProps {
  listingId: string;
  listingTitle: string;
  price: number;
  onUnlock?: () => void;
}

export default function PremiumAccess({ listingId, listingTitle, price, onUnlock }: PremiumAccessProps) {
  const { user, hasAccessToListing } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const hasAccess = hasAccessToListing ? hasAccessToListing(listingId) : false;

  const handlePurchaseAccess = async () => {
    if (!user) {
      toast.error('Please log in to purchase access');
      return;
    }

    setIsLoading(true);
    try {
      // Call our API to create a checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: STRIPE_PRICE_IDS.PREMIUM_ACCESS,
          customerEmail: user.email,
          userId: user.id,
          productType: 'premium_access',
          customUnitAmount: price * 100, // Convert to cents for Stripe
          metadata: {
            userId: user.id,
            listingId,
            listingTitle
          }
        }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating premium access purchase:', error);
      toast.error('Failed to process purchase');
    } finally {
      setIsLoading(false);
    }
  };

  // User already has access
  if (hasAccess) {
    return (
      <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-purple-800/40 flex items-center justify-center mr-4">
            <FiUnlock className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-medium text-purple-300">Premium Access Unlocked</h3>
        </div>
        <p className="text-gray-300 mb-4">
          You have full access to this premium content. Enjoy!
        </p>
        <div className="flex justify-end">
          <button
            onClick={onUnlock}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg flex items-center"
          >
            <FiZap className="mr-2" />
            View Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-purple-800/40 flex items-center justify-center mr-4">
          <FiLock className="h-6 w-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-medium text-white">Premium Content</h3>
      </div>
      
      <p className="text-gray-300 mb-6">
        This content requires premium access. Purchase now to unlock 
        exclusive features and content.
      </p>
      
      <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <FiCheckCircle className="text-purple-500 mr-2" />
          <span className="text-gray-200 font-medium">What You'll Get</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1 ml-6 list-disc">
          <li>Full access to premium content</li>
          <li>Downloadable resources</li>
          <li>Source code and examples</li>
          <li>Creator support</li>
        </ul>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-purple-400">${price.toFixed(2)} USD</div>
        <div className="text-sm text-gray-400">One-time purchase</div>
      </div>
      
      <button
        onClick={handlePurchaseAccess}
        disabled={isLoading}
        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          <>
            <FiUnlock className="mr-2" />
            Purchase Access
          </>
        )}
      </button>
    </div>
  );
} 