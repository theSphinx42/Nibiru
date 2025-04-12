import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCheck, FiDownload, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/format';

// Interface for purchased products
interface PurchasedProduct {
  id: string;
  name: string;
  price: number;
  version?: string;
  fileUrl: string;
}

const CheckoutSuccessPage = () => {
  const router = useRouter();
  const { orderId, itemId } = router.query;
  const { state, clearCart } = useCart();
  const [purchasedItems, setPurchasedItems] = useState<PurchasedProduct[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate order ID only if one wasn't provided
  const displayOrderId = orderId || 'ORD-0000';
  
  useEffect(() => {
    // Check if this is a valid success page visit
    const isValidVisit = orderId && itemId;
    
    if (!isValidVisit) {
      // If accessed directly or via back button, redirect to dashboard
      window.location.href = '/dashboard';
      return;
    }

    // Clear the cart
    clearCart();
    
    // If we have an itemId, create a single purchased item
    if (itemId) {
      setPurchasedItems([{
        id: itemId as string,
        name: 'Beer8',
        price: 1.00,
        version: '1.0.0',
        fileUrl: '/downloads/beer.zip'
      }]);
    }

    setIsLoading(false);
  }, [itemId, orderId, clearCart]);

  const handleDownload = async (item: PurchasedProduct) => {
    try {
      setIsDownloading(true);
      
      // Create a dummy beer file for download
      const beerContent = `This is your purchased Beer.zip file!\n
Product: ${item.name}
Order ID: ${displayOrderId}
Thank you for your purchase!

Contents:
- beer-recipe.txt
- brewing-instructions.pdf
- beer-label-design.png
`;
      
      const blob = new Blob([beerContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'beer.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Log the download
      console.log(`Downloaded ${item.name}`);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleContinueShopping = () => {
    // Use direct navigation instead of Next.js router
    window.location.href = '/marketplace';
  };

  const handleGoToDashboard = () => {
    // Use direct navigation instead of Next.js router
    window.location.href = '/dashboard';
  };

  // Add cleanup effect and force enable navigation
  useEffect(() => {
    // Enable navigation
    if (typeof window !== 'undefined') {
      // Clear any route blocking
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = function() {
        window.location.href = '/dashboard';
      };
    }

    return () => {
      // Clear the popstate handler
      if (typeof window !== 'undefined') {
        window.onpopstate = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 text-white py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-400">Verifying purchase...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-green-500 rounded-full p-3 mb-4"
            >
              <FiCheck className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">Thank you for your purchase!</h1>
            <p className="text-gray-400 text-lg">
              Your order #{displayOrderId} has been confirmed
            </p>
            <p className="text-gray-400">
              You will receive an email with your order details shortly
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Digital Products</h2>
            {purchasedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 border-b border-gray-700 last:border-0"
              >
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-400">Version {item.version}</p>
                </div>
                <button
                  onClick={() => handleDownload(item)}
                  disabled={isDownloading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
                    ${isDownloading 
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <FiDownload />
                  <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGoToDashboard}
              className="flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleContinueShopping}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Continue Shopping
              <FiArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccessPage; 