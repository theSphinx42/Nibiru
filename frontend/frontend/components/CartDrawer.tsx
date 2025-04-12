import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { state, removeItem, clearCart } = useCart();

  const handleCheckout = async () => {
    // Implement checkout logic here
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-96 bg-[#0D1117] border-l border-[#1C2128] z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Cart</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {state.items.length > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between p-4 bg-[#161B22] rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg" />
                        <div>
                          <h3 className="text-white font-medium">{item.name}</h3>
                          <p className="text-gray-400">${item.price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </div>
                <div className="border-t border-[#1C2128] pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold">${state.total}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Checkout
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">
                Your cart is empty
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 