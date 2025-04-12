import { FiDollarSign, FiInfo, FiHelpCircle } from 'react-icons/fi';
import { HiOutlineCash } from 'react-icons/hi';

interface SalesFeesInfoProps {
  productPrice?: number;
}

export default function SalesFeesInfo({ productPrice }: SalesFeesInfoProps) {
  // Calculate the platform fee (1% or $1 minimum)
  const platformFee = productPrice ? Math.max(productPrice * 0.01, 1) : 1;
  const sellerReceives = productPrice ? productPrice - platformFee : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="h-8 w-8 rounded-full bg-blue-800/40 flex items-center justify-center mr-3">
          <HiOutlineCash className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white">Platform Fee Information</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-300 text-sm">
          Nibiru charges a 1% fee on all sales with a $1 minimum fee.
          This helps us maintain and improve the platform for all users.
        </p>
      </div>
      
      {productPrice && (
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Pricing Breakdown</h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Product Price:</div>
            <div className="text-right text-white font-medium">${productPrice.toFixed(2)}</div>
            
            <div className="text-gray-400">Platform Fee (1%):</div>
            <div className="text-right text-blue-400 font-medium">${platformFee.toFixed(2)}</div>
            
            <div className="text-gray-400 border-t border-gray-700 pt-1 mt-1">You Receive:</div>
            <div className="text-right text-green-400 font-medium border-t border-gray-700 pt-1 mt-1">${sellerReceives.toFixed(2)}</div>
          </div>
        </div>
      )}
      
      <div className="flex items-start text-xs text-gray-400">
        <FiInfo className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
        <span>
          Platform fees are subject to change with 30 days notice. 
          Payouts are processed every 7 days for all completed sales.
        </span>
      </div>
    </div>
  );
} 