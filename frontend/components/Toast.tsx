import { createContext, useContext, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message, {
          style: {
            background: '#065f46',
            color: '#fff',
          },
        });
        break;
      case 'error':
        toast.error(message, {
          style: {
            background: '#991b1b',
            color: '#fff',
          },
        });
        break;
      default:
        toast(message, {
          style: {
            background: '#1e40af',
            color: '#fff',
          },
        });
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '0.5rem',
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 