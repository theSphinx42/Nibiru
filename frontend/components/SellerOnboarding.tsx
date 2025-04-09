import { useState } from 'react';
import { FiShoppingBag, FiDollarSign, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { STRIPE_PRICE_IDS } from '../lib/stripe';
import { UserRole } from '../types/user';
import { toast } from 'react-hot-toast';

export default function SellerOnboarding() {
  const { user, updateUserProfile, hasPaidOnboardingFee, isSeller } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleBecomeSellerClick = async () => {
    if (!user) {
      toast.error('Please log in to become a seller');
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
          priceId: STRIPE_PRICE_IDS.SELLER_ONBOARDING,
          customerEmail: user.email,
          userId: user.id,
          productType: 'seller_onboarding',
          metadata: {
            userId: user.id,
            email: user.email
          }
        }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating seller onboarding:', error);
      toast.error('Failed to process seller onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  // Already a seller
  if (isSeller) {
    return (
      <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-indigo-800/40 flex items-center justify-center mr-4">
            <FiCheckCircle className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-medium text-indigo-300">Seller Status Active</h3>
        </div>
        <p className="text-gray-300 mb-4">
          You're already a verified seller on the platform. You can create and sell your products in the marketplace.
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => window.location.href = '/dashboard/create'}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg flex items-center"
          >
            <FiShoppingBag className="mr-2" />
            Create New Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-indigo-800/40 flex items-center justify-center mr-4">
          <FiShoppingBag className="h-6 w-6 text-indigo-400" />
        </div>
        <h3 className="text-xl font-medium text-white">Become a Seller</h3>
      </div>
      
      <p className="text-gray-300 mb-6">
        Unlock the ability to create and sell your own products on our marketplace. 
        A one-time $1 fee gives you lifetime seller privileges.
      </p>
      
      <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <FiShield className="text-green-500 mr-2" />
          <span className="text-gray-200 font-medium">Seller Benefits</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1 ml-6 list-disc">
          <li>Create unlimited listings</li>
          <li>Reach potential customers</li>
          <li>Secure payment processing</li>
          <li>Detailed analytics</li>
        </ul>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-indigo-400">$1.00 USD</div>
        <div className="text-sm text-gray-400">One-time payment</div>
      </div>
      
      <button
        onClick={handleBecomeSellerClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          <>
            <FiDollarSign className="mr-2" />
            Become a Seller
          </>
        )}
      </button>
    </div>
  );
} 