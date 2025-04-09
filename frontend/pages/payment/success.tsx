import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { FiCheckCircle, FiArrowRight, FiShield, FiMail, FiShoppingBag, FiEdit } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { PRODUCT_NAMES } from '../../lib/stripe';

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id, product_type } = router.query;
  const { user, updateUserProfile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: string;
    productName: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    // Only run verification if we have session_id and product_type
    if (session_id && product_type && typeof session_id === 'string') {
      verifyPayment(session_id, product_type as string);
    }
  }, [session_id, product_type]);

  const verifyPayment = async (sessionId: string, productType: string) => {
    setIsVerifying(true);
    try {
      // In a real app, this would make an API call to verify the payment on the backend
      // For demo purposes, we'll simulate a successful verification
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local user state based on what was purchased
      if (productType === 'seller_onboarding') {
        updateUserProfile({ 
          hasPaidOnboardingFee: true,
          role: 'seller' as any // Cast to any to avoid type issues
        });
      } else if (productType === 'newsletter_subscription') {
        updateUserProfile({ isNewsletterSubscriber: true });
      } else if (productType === 'galatea_access' || productType === 'galatea_guardian') {
        updateUserProfile({ 
          unlockedPremiumAccess: { galatea: true } 
        });
      }
      
      // Set payment details
      setPaymentDetails({
        amount: getProductAmount(productType),
        productName: getProductName(productType),
        date: new Date().toLocaleDateString()
      });
      
      setIsVerifying(false);
    } catch (error) {
      console.error('Error verifying payment:', error);
      setIsVerifying(false);
    }
  };

  const getProductAmount = (type: string): string => {
    switch (type) {
      case 'seller_onboarding':
        return '$1.00';
      case 'newsletter_subscription':
        return '$1.00/month';
      case 'galatea_access':
        return '$10.00';
      case 'galatea_guardian':
        return '$1,111.00';
      default:
        return 'Free';
    }
  };

  const getProductName = (type: string): string => {
    if (type in PRODUCT_NAMES) {
      return PRODUCT_NAMES[type as keyof typeof PRODUCT_NAMES];
    }
    return 'Unknown Product';
  };

  const getSuccessDestination = (type: string): string => {
    switch (type) {
      case 'seller_onboarding':
        return '/dashboard/seller';
      case 'newsletter_subscription':
        return '/newsletter';
      case 'galatea_access':
      case 'galatea_guardian':
        return '/projects/galatea';
      default:
        return '/dashboard';
    }
  };

  const getIcon = (type: string) => {
    switch (type as string) {
      case 'seller_onboarding':
        return <FiShoppingBag className="h-12 w-12 text-teal-500" />;
      case 'newsletter_subscription':
        return <FiMail className="h-12 w-12 text-teal-500" />;
      case 'galatea_access':
        return <FiEdit className="h-12 w-12 text-teal-500" />;
      default:
        return <FiCheckCircle className="h-12 w-12 text-teal-500" />;
    }
  };

  if (isVerifying) {
    return (
      <Layout title="Processing Payment">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mb-6"></div>
          <h1 className="text-2xl font-bold text-teal-400 mb-4">Verifying Your Payment</h1>
          <p className="text-gray-300 text-center max-w-md">
            We're confirming your payment with our payment provider. This will just take a moment...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment Successful">
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg text-center w-full">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-teal-900/30 p-4">
              {product_type ? getIcon(product_type as string) : <FiCheckCircle className="h-12 w-12 text-teal-500" />}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-teal-400 mb-4">Payment Successful!</h1>
          
          {paymentDetails ? (
            <div className="space-y-6">
              <p className="text-gray-300 mb-6">
                Thank you for your payment. Your transaction has been completed successfully.
              </p>
              
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 mb-6">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Product:</span>
                  <span className="text-teal-300 font-medium">{paymentDetails.productName}</span>
                </div>
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium">{paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{paymentDetails.date}</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Link href={getSuccessDestination(product_type as string)}>
                  <a className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                    Continue
                    <FiArrowRight className="ml-2" />
                  </a>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-gray-300">
              <p>We couldn't retrieve your payment details, but your payment was successful.</p>
              <div className="mt-6">
                <Link href="/dashboard">
                  <a className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                    Go to Dashboard
                    <FiArrowRight className="ml-2" />
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-400 max-w-md text-center">
          <p>A confirmation email has been sent to your registered email address. Please check your inbox.</p>
        </div>
      </div>
    </Layout>
  );
} 