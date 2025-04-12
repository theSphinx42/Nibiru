import { GlyphCommand } from '@/components/GlyphCommandBar';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'saphira' | 'claude' | 'system';
  timestamp: Date;
}

export interface RelayCycle {
  id: string;
  title?: string;
  topic?: string;
  messages: Message[];
  glyphsUsed: GlyphCommand[];
  quantumScore: number;
  startTime: Date;
  endTime: Date;
  hash: string;
  signature?: string;
}

export interface ChronicleEntry {
  cycle: RelayCycle;
  metadata: {
    version: string;
    platform: string;
    chronicleHash: string;
    previousHash: string | null;
    quantumEntropy?: number;
  };
} 