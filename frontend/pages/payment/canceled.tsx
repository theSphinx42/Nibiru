import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { FiAlertTriangle, FiChevronLeft, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

export default function PaymentCanceled() {
  const router = useRouter();
  
  const handleRetry = () => {
    router.back();
  };
  
  return (
    <Layout title="Payment Canceled">
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg text-center w-full">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-amber-900/30 p-4">
              <FiAlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-amber-400 mb-4">Payment Canceled</h1>
          
          <div className="space-y-6">
            <p className="text-gray-300 mb-6">
              Your payment process was canceled and you have not been charged.
            </p>
            
            <div className="border border-gray-700 rounded-lg p-5 bg-gray-900/50 mb-6 text-left">
              <h3 className="text-lg font-medium text-amber-300 mb-3">What would you like to do next?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span> 
                  <span>Try again with a different payment method</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Return to the previous page</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Contact support if you're experiencing issues</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleRetry}
                className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Try Again
              </button>
              
              <Link href="/dashboard">
                <a className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  <FiChevronLeft className="mr-2" />
                  Return to Dashboard
                </a>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-400 max-w-md text-center">
          <p>If you continue to experience issues with payment, please contact our support team.</p>
        </div>
      </div>
    </Layout>
  );
} 