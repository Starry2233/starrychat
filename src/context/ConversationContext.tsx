import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ChatMessage } from '../types';

const STORAGE_KEY = 'skillhub-chat-conversations';
const MAX_TITLE_LEN = 24;

export interface Conversation {
  id: string;
  title: string;
  autoNamed: boolean;
  createdAt: number;
  updatedAt: number;
  isProcessing: boolean;
  messages: ChatMessage[];
}

interface ConversationContextValue {
  conversations: Conversation[];
  currentId: string | null;
  currentConv: Conversation | null;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  switchConversation: (id: string) => void;
  setConversationMessages: (id: string, messages: ChatMessage[]) => void;
  setConversationProcessing: (id: string, processing: boolean) => void;
  exportConversation: (id: string) => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch {}
}

function genId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    if (loaded.length === 0) {
      const first: Conversation = {
        id: genId(),
        title: '新对话',
        autoNamed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isProcessing: false,
        messages: [],
      };
      saveConversations([first]);
      return [first];
    }
    return loaded;
  });

  const [currentId, setCurrentId] = useState<string>(() => {
    const saved = conversations[0]?.id;
    return saved;
  });

  // Persist on changes (but debounce for streaming writes)
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const currentConv = conversations.find((c) => c.id === currentId) ?? null;

  const createConversation = useCallback(() => {
    const conv: Conversation = {
      id: genId(),
      title: '新对话',
      autoNamed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isProcessing: false,
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setCurrentId(conv.id);
    return conv.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fallback: Conversation = {
          id: genId(),
          title: '新对话',
          autoNamed: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isProcessing: false,
          messages: [],
        };
        return [fallback];
      }
      return next;
    });
    setCurrentId((prev) => {
      if (prev === id) {
        // switch to the first available
        const convs = conversations.filter((c) => c.id !== id);
        return convs[0]?.id || prev;
      }
      return prev;
    });
  }, [conversations]);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: title.trim() || '新对话', autoNamed: false, updatedAt: Date.now() } : c)),
    );
  }, []);

  const switchConversation = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  const setConversationMessages = useCallback((id: string, messages: ChatMessage[]) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        // Auto-title from first user message
        let title = c.title;
        let autoNamed = c.autoNamed;
        if (c.autoNamed && messages.length > 0) {
          const firstUser = messages.find((m) => m.role === 'user');
          if (firstUser) {
            const t = firstUser.content.trim().slice(0, MAX_TITLE_LEN);
            title = t || '新对话';
            autoNamed = true;
          }
        }
        return {
          ...c,
          title,
          autoNamed,
          messages,
          updatedAt: Date.now(),
        };
      }),
    );
  }, []);

  const setConversationProcessing = useCallback((id: string, processing: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isProcessing: processing } : c)),
    );
  }, []);

  const exportConversation = useCallback((id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    const data = {
      title: conv.title,
      exportedAt: new Date().toISOString(),
      messages: conv.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[\\/:*?"<>|]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversations]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentId,
        currentConv,
        createConversation,
        deleteConversation,
        renameConversation,
        switchConversation,
        setConversationMessages,
        setConversationProcessing,
        exportConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversations must be used within ConversationProvider');
  return ctx;
}
