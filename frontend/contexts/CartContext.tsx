import { createContext, useContext, useReducer, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  quantity: number;
}

interface SavedItem extends Omit<CartItem, 'quantity'> {}

interface CartState {
  items: CartItem[];
  savedItems: SavedItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SAVE_FOR_LATER'; payload: string }
  | { type: 'MOVE_TO_CART'; payload: string }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  clearCart: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + (action.payload.price || 10)
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1, price: action.payload.price || 10 }],
        total: state.total + (action.payload.price || 10)
      };
    }

    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;

      const quantityDiff = action.payload.quantity - item.quantity;
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + (item.price * quantityDiff)
      };
    }

    case 'SAVE_FOR_LATER': {
      const item = state.items.find(item => item.id === action.payload);
      if (!item) return state;

      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        savedItems: [...state.savedItems, { ...item }],
        total: state.total - (item.price * item.quantity)
      };
    }

    case 'MOVE_TO_CART': {
      const item = state.savedItems.find(item => item.id === action.payload);
      if (!item) return state;

      return {
        ...state,
        items: [...state.items, { ...item, quantity: 1 }],
        savedItems: state.savedItems.filter(i => i.id !== action.payload),
        total: state.total + item.price
      };
    }

    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      return {
        items: state.items.filter(item => item.id !== action.payload),
        savedItems: state.savedItems,
        total: state.total - (itemToRemove?.price || 0)
      };
    case 'CLEAR_CART':
      return { items: [], savedItems: [], total: 0 };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], savedItems: [], total: 0 });

  const addItem = (item: Omit<CartItem, 'quantity'>) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const saveForLater = (id: string) => dispatch({ type: 'SAVE_FOR_LATER', payload: id });
  const moveToCart = (id: string) => dispatch({ type: 'MOVE_TO_CART', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, saveForLater, moveToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 