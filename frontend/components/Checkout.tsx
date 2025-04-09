import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Checkout = ({ isOpen, onClose }: CheckoutProps) => {
  const { state, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearCart();
      onClose();
      // You would typically redirect to a success page
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[#0D1117] rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Checkout</h2>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Step {step} of 3</span>
            <button onClick={onClose} className="hover:text-white">
              ✕
            </button>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Order Summary</h3>
            {state.items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-400">
                  {item.name} x{item.quantity}
                </span>
                <span className="text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-[#1C2128] pt-4">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">${state.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Payment Method</h3>
            {/* Add payment form here */}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Confirm Purchase</h3>
            {/* Add confirmation details here */}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step === 3) {
                handleCheckout();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg font-medium
                     ${isProcessing
                       ? 'bg-[#2F81F7]/50 cursor-not-allowed'
                       : 'bg-[#2F81F7] hover:bg-[#2F81F7]/90'}`}
          >
            {isProcessing
              ? 'Processing...'
              : step === 3
              ? 'Complete Purchase'
              : 'Continue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}; 