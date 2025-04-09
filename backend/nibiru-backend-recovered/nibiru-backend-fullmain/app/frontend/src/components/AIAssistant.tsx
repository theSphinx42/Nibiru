import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { IconButton, TextField, Button, Typography, Box, Paper } from '@mui/material';
import {
  Help as HelpIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
  Search as SearchIcon,
  Send as SendIcon
} from '@mui/icons-material';

interface Suggestion {
  type: 'action' | 'insight' | 'tip';
  message: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface FAQ {
  topic: string;
  relevance: 'high' | 'medium';
}

interface AIAssistantProps {
  className?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [faqResults, setFaqResults] = useState<FAQ[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1] || 'dashboard';
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions based on current page
  const { data: contextData } = useQuery(
    ['aiContext', currentPage],
    async () => {
      const response = await axios.get(`/api/v1/ai-assistant/suggestions?current_page=${currentPage}`);
      return response.data;
    },
    {
      enabled: !!user && isOpen,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Update suggestions when context data changes
  useEffect(() => {
    if (contextData) {
      setSuggestions(contextData);
    }
  }, [contextData]);

  // Search FAQ
  const searchFAQ = async (query: string) => {
    if (!query.trim()) {
      setFaqResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`/api/v1/ai-assistant/faq?query=${encodeURIComponent(query)}`);
      setFaqResults(response.data);
    } catch (error) {
      console.error('Error searching FAQ:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (action: string) => {
    // Update user patterns
    await axios.post('/api/v1/ai-assistant/patterns/update', {
      action: 'click_suggestion',
      entity_type: action
    });

    // Handle the action (implement based on your needs)
    console.log('Handling action:', action);
  };

  // Handle FAQ click
  const handleFaqClick = async (topic: string) => {
    // Update user patterns
    await axios.post('/api/v1/ai-assistant/patterns/update', {
      action: 'view_faq',
      entity_type: topic
    });

    // Handle FAQ view (implement based on your needs)
    console.log('Viewing FAQ:', topic);
  };

  return (
    <div className={className}>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <IconButton
              onClick={() => setIsOpen(true)}
              className="bg-primary text-white shadow-lg hover:bg-primary-dark"
              size="large"
            >
              <HelpIcon />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 z-50 w-96 ${
              isMinimized ? 'h-12' : 'h-[600px]'
            }`}
          >
            <Paper className="h-full flex flex-col shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-2 border-b">
                <Typography variant="h6" className="flex items-center gap-2">
                  <HelpIcon className="text-primary" />
                  AI Assistant
                </Typography>
                <div className="flex gap-1">
                  <IconButton
                    size="small"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setIsOpen(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>

              {/* Content */}
              {!isMinimized && (
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Search */}
                  <div className="mb-4">
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search for help..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchFAQ(e.target.value);
                      }}
                      InputProps={{
                        startAdornment: <SearchIcon className="text-gray-400 mr-1" />,
                      }}
                    />
                  </div>

                  {/* FAQ Results */}
                  {faqResults.length > 0 && (
                    <div className="mb-4">
                      <Typography variant="subtitle1" className="font-semibold mb-2">
                        Related Topics
                      </Typography>
                      <div className="space-y-2">
                        {faqResults.map((faq, index) => (
                          <Button
                            key={index}
                            variant="text"
                            className="w-full justify-start"
                            onClick={() => handleFaqClick(faq.topic)}
                          >
                            {faq.topic}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div ref={suggestionsRef}>
                      <Typography variant="subtitle1" className="font-semibold mb-2">
                        Suggestions
                      </Typography>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <Paper
                            key={index}
                            className={`p-3 cursor-pointer transition-colors ${
                              suggestion.priority === 'high'
                                ? 'bg-red-50 hover:bg-red-100'
                                : suggestion.priority === 'medium'
                                ? 'bg-yellow-50 hover:bg-yellow-100'
                                : 'bg-blue-50 hover:bg-blue-100'
                            }`}
                            onClick={() => handleSuggestionClick(suggestion.action)}
                          >
                            <Typography variant="body2" className="font-medium">
                              {suggestion.message}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {suggestion.type === 'action'
                                ? 'Click to take action'
                                : suggestion.type === 'insight'
                                ? 'Click to view details'
                                : 'Click to learn more'}
                            </Typography>
                          </Paper>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant; 