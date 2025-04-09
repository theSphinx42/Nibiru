import { createContext, useContext, useReducer, ReactNode } from 'react';
import { GlyphCommand } from '@/components/GlyphCommandBar';

interface Message {
  id: string;
  content: string;
  sender: 'claude' | 'saphira' | 'user' | 'system';
  timestamp: Date;
}

interface ConsoleState {
  messages: Message[];
  activeCommand: GlyphCommand | null;
  memoryQueue: string[];
  lastClaudeMessage: string | null;
  lastSaphiraMessage: string | null;
  isProcessing: boolean;
}

type ConsoleAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_ACTIVE_COMMAND'; payload: GlyphCommand | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'PUSH_TO_QUEUE'; payload: string }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'ARCHIVE_THREAD' };

const initialState: ConsoleState = {
  messages: [],
  activeCommand: null,
  memoryQueue: [],
  lastClaudeMessage: null,
  lastSaphiraMessage: null,
  isProcessing: false
};

const consoleReducer = (state: ConsoleState, action: ConsoleAction): ConsoleState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      const newMessage = action.payload;
      return {
        ...state,
        messages: [...state.messages, newMessage],
        lastClaudeMessage: newMessage.sender === 'claude' ? newMessage.content : state.lastClaudeMessage,
        lastSaphiraMessage: newMessage.sender === 'saphira' ? newMessage.content : state.lastSaphiraMessage
      };

    case 'SET_ACTIVE_COMMAND':
      return {
        ...state,
        activeCommand: action.payload
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };

    case 'PUSH_TO_QUEUE':
      return {
        ...state,
        memoryQueue: [...state.memoryQueue, action.payload]
      };

    case 'CLEAR_QUEUE':
      return {
        ...state,
        memoryQueue: []
      };

    case 'ARCHIVE_THREAD':
      return {
        ...initialState
      };

    default:
      return state;
  }
};

const ConsoleContext = createContext<{
  state: ConsoleState;
  dispatch: React.Dispatch<ConsoleAction>;
} | null>(null);

export const ConsoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(consoleReducer, initialState);

  return (
    <ConsoleContext.Provider value={{ state, dispatch }}>
      {children}
    </ConsoleContext.Provider>
  );
};

export const useConsole = () => {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
}; 