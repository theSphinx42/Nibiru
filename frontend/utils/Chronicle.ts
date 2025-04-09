import { ChronicleEntry, RelayCycle, Message } from '@/types/chronicle';
import { GlyphCommand } from '@/components/GlyphCommandBar';

const CHRONICLE_VERSION = '1.0.0';
const STORAGE_KEY = 'saphira_chronicle';

export class Chronicle {
  private static instance: Chronicle;
  private entries: ChronicleEntry[] = [];
  private currentCycle: Partial<RelayCycle> | null = null;
  private platform: string;

  private constructor() {
    this.platform = typeof window !== 'undefined' ? window.navigator.platform : 'unknown';
    this.loadFromStorage();
  }

  static getInstance(): Chronicle {
    if (!Chronicle.instance) {
      Chronicle.instance = new Chronicle();
    }
    return Chronicle.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.entries = parsed.map((entry: any) => ({
          ...entry,
          cycle: {
            ...entry.cycle,
            startTime: new Date(entry.cycle.startTime),
            endTime: new Date(entry.cycle.endTime),
            messages: entry.cycle.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load Chronicle from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Failed to save Chronicle to storage:', error);
    }
  }

  private generateHash(data: any): string {
    // Simple hash function for demo - in production, use a proper crypto hash
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
  }

  startCycle(title?: string): void {
    if (this.currentCycle) {
      throw new Error('A cycle is already in progress');
    }

    this.currentCycle = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      glyphsUsed: [],
      startTime: new Date(),
      quantumScore: 0
    };
  }

  addMessage(message: Message): void {
    if (!this.currentCycle) {
      throw new Error('No cycle in progress');
    }

    if (!this.currentCycle.messages) {
      this.currentCycle.messages = [];
    }

    this.currentCycle.messages.push(message);
  }

  recordGlyphUse(glyph: GlyphCommand): void {
    if (!this.currentCycle) {
      throw new Error('No cycle in progress');
    }

    if (!this.currentCycle.glyphsUsed) {
      this.currentCycle.glyphsUsed = [];
    }

    this.currentCycle.glyphsUsed.push(glyph);
  }

  endCycle(quantumScore: number): ChronicleEntry {
    if (!this.currentCycle) {
      throw new Error('No cycle in progress');
    }

    const cycle: RelayCycle = {
      ...this.currentCycle as RelayCycle,
      endTime: new Date(),
      quantumScore,
      hash: ''
    };

    // Generate hash after setting all other properties
    cycle.hash = this.generateHash({
      ...cycle,
      hash: null // Exclude hash from hash generation
    });

    const entry: ChronicleEntry = {
      cycle,
      metadata: {
        version: CHRONICLE_VERSION,
        platform: this.platform,
        chronicleHash: this.generateHash(this.entries),
        previousHash: this.entries.length > 0 
          ? this.entries[this.entries.length - 1].cycle.hash 
          : null,
        quantumEntropy: Math.random() // Replace with actual quantum entropy in production
      }
    };

    this.entries.push(entry);
    this.saveToStorage();
    this.currentCycle = null;

    return entry;
  }

  getCurrentCycle(): Partial<RelayCycle> | null {
    return this.currentCycle;
  }

  getEntries(): ChronicleEntry[] {
    return this.entries;
  }

  getEntry(hash: string): ChronicleEntry | undefined {
    return this.entries.find(entry => entry.cycle.hash === hash);
  }

  exportToJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  exportEntry(hash: string): string | null {
    const entry = this.getEntry(hash);
    return entry ? JSON.stringify(entry, null, 2) : null;
  }

  async downloadJSON(hash?: string): Promise<void> {
    const data = hash ? this.exportEntry(hash) : this.exportToJSON();
    if (!data) return;

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = hash 
      ? `chronicle-entry-${hash.substring(2, 10)}.json`
      : `saphira-chronicle-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  deleteEntry(hash: string): boolean {
    const index = this.entries.findIndex(entry => entry.cycle.hash === hash);
    if (index === -1) return false;
    
    this.entries.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  clear(): void {
    this.entries = [];
    this.currentCycle = null;
    this.saveToStorage();
  }
} 