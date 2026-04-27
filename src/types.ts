export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  reasoning?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  apiUrl: string;
  showThinking: boolean;
}

export type PageView = 'chat' | 'settings';
