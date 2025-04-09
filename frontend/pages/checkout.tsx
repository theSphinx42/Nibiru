import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiCheck, FiCreditCard, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/format';
import { useCart } from '../contexts/CartContext';

// Mock checkout data
interface CheckoutItem {
  id: string;
  title: string;
  price: number;
  thumbnailUrl?: string;
  quantity?: number;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { state } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  
  // Calculate totals
  const subtotal = state.items.reduce((acc, item) => acc + (item.price || 10) * item.quantity, 0);
  const tax = subtotal * 0.07; // Example 7% tax
  const total = subtotal + tax;

  useEffect(() => {
    // Transform cart items to checkout items
    const checkoutItems = state.items.map(item => ({
      id: item.id,
      title: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    setItems(checkoutItems);
    setIsLoading(false);
  }, [state.items]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success!
      toast.success('Payment successful!');
      
      // Navigate to success page
      router.push('/checkout/success');
    } catch (err) {
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Checkout">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout title="Checkout">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-200">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-400">Start adding items to your cart</p>
            <div className="mt-6">
              <Link href="/marketplace" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Checkout Items and Form - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-200 mb-6">Checkout</h1>
              
              {/* Items in cart */}
              <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                <ul className="divide-y divide-gray-700">
                  {items.map((item) => (
                    <li key={item.id} className="p-4 flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                        {item.thumbnailUrl ? (
                          <Image src={item.thumbnailUrl} alt={item.title} width={48} height={48} className="object-cover" />
                        ) : (
                          <FiShoppingCart className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{item.title}</p>
                        {item.quantity && item.quantity > 1 && (
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-200">
                        {formatPrice(item.price * (item.quantity || 1))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Payment Form */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-200 mb-4">Payment Information</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-400">
                      Name on card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-200"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-400">
                      Card number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-200"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expDate" className="block text-sm font-medium text-gray-400">
                        Expiration date
                      </label>
                      <input
                        type="text"
                        id="expDate"
                        className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-200"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-400">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-200"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Order Summary - 1/3 width */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-200 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-200">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax (7%)</span>
                  <span className="text-gray-200">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-200">Total</span>
                    <span className="text-indigo-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  isProcessing ? 'bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard className="mr-2" />
                    Complete Purchase
                  </>
                )}
              </button>
              
              <p className="mt-4 text-xs text-gray-400 text-center">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage; 