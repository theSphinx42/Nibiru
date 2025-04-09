import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiShoppingCart, FiTrash2, FiCreditCard, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';

const CartIcon: React.FC = () => {
  const { state, removeItem, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If cart is empty, don't show anything
  if (state.items.length === 0) {
    return null;
  }

  const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleGoToCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center text-gray-300 hover:text-white transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Shopping cart"
      >
        <FiShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">Your Cart</h3>
                <span className="text-sm text-gray-400">{totalItems} items</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {state.items.length > 0 ? (
                <div>
                  <ul className="divide-y divide-gray-700">
                    {state.items.map((item) => (
                      <li key={item.id} className="p-4 flex items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                          <p className="text-sm text-gray-400">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="ml-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="p-4 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-200">Total:</span>
                      <span className="font-bold text-indigo-400">{formatPrice(state.total)}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleGoToCheckout}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiCreditCard />
                        <span>Checkout</span>
                      </button>
                      
                      <button
                        onClick={clearCart}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                        aria-label="Empty cart"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <p>Your cart is empty</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartIcon; 