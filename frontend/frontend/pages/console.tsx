import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ConsoleLayout from '../components/ConsoleLayout';
import { usePipeline } from '../services/pipelineService';
import { useDebug } from '../contexts/DebugContext';

export default function ConsolePage() {
  const router = useRouter();
  const pipeline = usePipeline();
  const { addLog } = useDebug();

  useEffect(() => {
    // Load saved history from localStorage if available
    const savedHistory = localStorage.getItem('pipelineHistory');
    if (savedHistory) {
      pipeline.importHistory(savedHistory);
    }
  }, []);

  // Save history to localStorage when messages change
  useEffect(() => {
    if (pipeline.messages.length > 0) {
      localStorage.setItem('pipelineHistory', pipeline.exportHistory());
    }
  }, [pipeline.messages]);

  const handleClaudeSubmit = async (prompt: string) => {
    try {
      await pipeline.send({
        id: Math.random().toString(36).substr(2, 9),
        from: 'claude',
        to: 'saphira',
        status: 'sent',
        content: prompt,
        tags: ['prompt', 'claude']
      });

      addLog({
        type: 'api',
        message: 'Claude prompt sent to pipeline',
        data: { prompt }
      });

      // TODO: Integrate with actual Claude API
      // For now, simulate a response
      setTimeout(() => {
        pipeline.send({
          id: Math.random().toString(36).substr(2, 9),
          from: 'claude',
          to: 'saphira',
          status: 'received',
          content: `Simulated Claude response to: ${prompt}`,
          tags: ['response', 'claude']
        });
      }, 2000);
    } catch (error) {
      addLog({
        type: 'error',
        message: 'Failed to send Claude prompt',
        data: { error }
      });
    }
  };

  const handleSaphiraSubmit = async (prompt: string) => {
    try {
      await pipeline.send({
        id: Math.random().toString(36).substr(2, 9),
        from: 'saphira',
        to: 'claude',
        status: 'sent',
        content: prompt,
        tags: ['prompt', 'saphira']
      });

      addLog({
        type: 'api',
        message: 'Saphira prompt sent to pipeline',
        data: { prompt }
      });

      // TODO: Integrate with actual Saphira API
      // For now, simulate a response
      setTimeout(() => {
        pipeline.send({
          id: Math.random().toString(36).substr(2, 9),
          from: 'saphira',
          to: 'claude',
          status: 'received',
          content: `Simulated Saphira response to: ${prompt}`,
          tags: ['response', 'saphira']
        });
      }, 2000);
    } catch (error) {
      addLog({
        type: 'error',
        message: 'Failed to send Saphira prompt',
        data: { error }
      });
    }
  };

  return (
    <ConsoleLayout
      onClaudeSubmit={handleClaudeSubmit}
      onSaphiraSubmit={handleSaphiraSubmit}
    />
  );
} 