import { useState } from 'react';
import { FiMail, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { STRIPE_PRICE_IDS } from '../lib/stripe';
import { toast } from 'react-hot-toast';

export default function NewsletterSubscription() {
  const { user, hasActiveNewsletter } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscription = async () => {
    if (!user && !email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Call our API to create a subscription checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: STRIPE_PRICE_IDS.NEWSLETTER_SUBSCRIPTION,
          customerEmail: user?.email || email,
          userId: user?.id,
          productType: 'newsletter_subscription',
          metadata: {
            userId: user?.id,
            email: user?.email || email
          }
        }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating newsletter subscription:', error);
      toast.error('Failed to process subscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Already subscribed
  if (hasActiveNewsletter) {
    return (
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-green-800/40 flex items-center justify-center mr-4">
            <FiCheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-xl font-medium text-green-300">Newsletter Active</h3>
        </div>
        <p className="text-gray-300 mb-2">
          You're currently subscribed to our premium developer newsletter. 
          Thank you for your support!
        </p>
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <FiInfo className="mr-2" />
          <span>Your next billing date is on the 1st of next month.</span>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => window.location.href = '/dashboard/account'}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-green-800/40 flex items-center justify-center mr-4">
          <FiMail className="h-6 w-6 text-green-400" />
        </div>
        <h3 className="text-xl font-medium text-white">Developer Newsletter</h3>
      </div>
      
      <p className="text-gray-300 mb-6">
        Subscribe to our premium developer newsletter for early access to features,
        tutorials, and insights from the team building the Nibiru platform.
      </p>
      
      <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <FiCheckCircle className="text-green-500 mr-2" />
          <span className="text-gray-200 font-medium">What You'll Get</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1 ml-6 list-disc">
          <li>Weekly deep dives into new features</li>
          <li>Behind-the-scenes development updates</li>
          <li>Advanced tutorials and code samples</li>
          <li>Early access to beta features</li>
        </ul>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-green-400">$1.00 USD</div>
        <div className="text-sm text-gray-400">Monthly subscription</div>
      </div>
      
      {!user && (
        <div className="mb-4">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="bg-gray-700 text-white w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      )}
      
      <button
        onClick={handleSubscription}
        disabled={isLoading}
        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          <>
            <FiMail className="mr-2" />
            Subscribe Now
          </>
        )}
      </button>
    </div>
  );
} 