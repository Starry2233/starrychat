import { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ConversationDrawer from './ConversationDrawer';
import { useSettings } from '../context/SettingsContext';
import { useConversations } from '../context/ConversationContext';
import { toolDefinitions, executeToolCall } from '../tools';
import type { ChatMessage, ChatState } from '../types';

const Layout = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  maxWidth: 800,
  alignSelf: 'center',
  position: 'relative',
});

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  paddingTop: 'max(12px, env(safe-area-inset-top))',
  backgroundColor: theme.palette.background.default,
  borderBottom: '1px solid',
  borderColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.04)',
  zIndex: 10,
}));

const HeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const StyledAvatar = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #6750A4, #D14D6A)',
  color: '#FFFFFF',
  boxShadow: '0 2px 8px rgba(103,80,164,0.3)',
}));

// ─── Streaming API ───────────────────────────────────────────

async function streamAiApi(
  messages: { role: string; content: string }[],
  settings: { apiKey: string; apiUrl: string; model: string },
  onChunk: (text: string, reasoning?: string) => void,
  signal?: AbortSignal
): Promise<string | null> {
  const url = `${settings.apiUrl.replace(/\/+$/, '')}/chat/completions`;

  const makeRequest = (stream: boolean) =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream,
      }),
      signal,
    });

  // ── Try streaming ──
  try {
    const res = await makeRequest(true);
    if (!res.ok) return null;

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let fullReasoning = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta || {};
          const content = delta.content || '';
          const reasoning = delta.reasoning_content || '';

          if (content) fullText += content;
          if (reasoning) fullReasoning += reasoning;
          if (content || reasoning) onChunk(fullText, fullReasoning || undefined);
        } catch {}
      }
    }

    return fullText;
  } catch {}

  // ── Fallback: non-streaming ──
  try {
    const res = await makeRequest(false);
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`API error ${res.status}: ${errBody || res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch {
    return null;
  }
}

// ─── System prompt ───────────────────────────────────────────

const SYSTEM_PROMPT = `请用中文回答用户的问题。

你有以下工具可供使用，当用户的问题需要实时信息或专业数据时，请主动使用这些工具：

1. **bing_search** — 通过必应搜索引擎搜索互联网上的最新信息。当用户询问实时新闻、最新事件、你不知道的信息时使用。
2. **stock_query** — 查询A股股票的各种数据，包括日线行情、技术指标（KDJ/MA/BOLL/RSI/CCI/BIAS/WR等）、龙虎榜、神奇九转等。注意：技术指标类需要提供 date 参数。

在需要时主动调用工具获取信息，不要编造数据。调用股票工具时记得带上日期参数。
请使用json格式调用工具，不要使用xml格式`;

// ─── Tool-calling loop ──────────────────────────────────────

async function runToolLoop(
  messages: { role: string; content: string }[],
  settings: { apiKey: string; apiUrl: string; model: string },
  maxDepth = 5,
): Promise<{ messages: { role: string; content: string }[]; toolsCalled: boolean }> {
  const working = [...messages];
  const url = `${settings.apiUrl.replace(/\/+$/, '')}/chat/completions`;
  let toolsCalled = false;

  for (let depth = 0; depth < maxDepth; depth++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: working,
        tools: toolDefinitions,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 4096,
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const data = await res.json();
    const choice = data.choices?.[0];
    if (!choice) throw new Error('API 返回为空');

    const msg = choice.message;

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      toolsCalled = true;
      const assistantMsg: { role: string; content: string; [key: string]: any } = { role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls };
      if (msg.reasoning_content) assistantMsg.reasoning_content = msg.reasoning_content;
      working.push(assistantMsg);
      for (const tc of msg.tool_calls) {
        const result = await executeToolCall(tc);
        working.push(result);
      }
    } else {
      const assistantMsg: { role: string; content: string; [key: string]: any } = { role: 'assistant', content: msg.content || '' };
      if (msg.reasoning_content) assistantMsg.reasoning_content = msg.reasoning_content;
      working.push(assistantMsg);
      break;
    }
  }

  return { messages: working, toolsCalled };
}

// ─── Helper ──────────────────────────────────────────────────

const MAX_TITLE_LEN = 24;

function deriveTitle(messages: ChatMessage[]): string | null {
  if (messages.length === 0) return null;
  const first = messages.find((m) => m.role === 'user');
  if (!first) return null;
  const t = first.content.trim().slice(0, MAX_TITLE_LEN);
  return t || null;
}

// ─── Component ───────────────────────────────────────────────

export default function ChatLayout() {
  const { settings, isConfigured } = useSettings();
  const { currentConv, currentId, switchConversation, setConversationMessages, setConversationProcessing, createConversation } = useConversations();

  const [state, setState] = useState<ChatState>({
    messages: [],
    isProcessing: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Load messages when switching conversations
  useEffect(() => {
    if (currentConv) {
      setState({
        messages: currentConv.messages,
        isProcessing: currentConv.isProcessing,
      });
    }
  }, [currentId]);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const updateLastMessage = useCallback(
    (content: string, reasoning?: string) => {
      setState((prev) => {
        const msgs = [...prev.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.role === 'assistant' && last.id.startsWith('stream-')) {
          msgs[msgs.length - 1] = { ...last, content, reasoning: reasoning || last.reasoning };
        }
        return { ...prev, messages: msgs };
      });
    },
    [],
  );

  const handleSend = async (text: string) => {
    if (!isConfigured) {
      setError('请先在设置中配置 API Key 和 API 地址');
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: text,
      role: 'user',
      timestamp: Date.now(),
    };

    const streamPlaceholder: ChatMessage = {
      id: `stream-${Date.now()}`,
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
      reasoning: '',
    };

    const newMessages = [...state.messages, userMsg, streamPlaceholder];

    setState({ messages: newMessages, isProcessing: true });
    setConversationProcessing(currentId!, true);

    // Mark title if first message
    const title = deriveTitle(newMessages);
    if (title && currentConv?.autoNamed !== false) {
      // The context will auto-name on saveMessages
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Build conversation with system prompt (includes tool definitions)
      const conversation = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...state.messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: text },
      ];

      // Run tool-calling loop (non-streaming, may execute tools)
      const { messages: enriched, toolsCalled } = await runToolLoop(conversation, settings);

      // When no tools were called, the last assistant message in enriched already
      // contains the response — pop it so streaming regenerates fresh content
      // (otherwise the model concatenates onto its own prior reply)
      if (!toolsCalled) enriched.pop();

      // Stream the final response (tool results already included)
      const result = await streamAiApi(
        enriched,
        settings,
        (chunkText, reasoning) => {
          updateLastMessage(chunkText, reasoning);
        },
        controller.signal,
      );

      if (!result) throw new Error('API 请求失败，请检查配置和网络连接');

      // Finalise
      setState((prev) => {
        const msgs = [...prev.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.id.startsWith('stream-')) {
          msgs[msgs.length - 1] = {
            ...last,
            id: `msg-${Date.now()}-reply`,
            content: result,
            reasoning: last.reasoning || undefined,
          };
        }
        return { ...prev, messages: msgs, isProcessing: false };
      });

      // Persist to context + localStorage
      const finalMsgs = newMessages.map((m) => {
        if (m.id.startsWith('stream-')) {
          return {
            ...m,
            id: `msg-${Date.now()}-reply`,
            content: result,
            reasoning: m.reasoning || undefined,
          };
        }
        return m;
      });
      setConversationMessages(currentId!, finalMsgs);
      setConversationProcessing(currentId!, false);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setState((prev) => {
        const msgs = prev.messages.filter((m) => !m.id.startsWith('stream-'));
        return { messages: msgs, isProcessing: false };
      });
      setConversationMessages(currentId!, state.messages);
      setConversationProcessing(currentId!, false);
      setError(err.message || '请求失败');
    } finally {
      abortRef.current = null;
    }
  };

  const handleNewChat = () => {
    createConversation();
  };

  return (
    <Layout>
      <Header>
        <HeaderLeft>
          <StyledAvatar>
            <AutoAwesomeRoundedIcon />
          </StyledAvatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={handleNewChat}>
              {currentConv?.title || 'AI 助手'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {state.isProcessing
                ? '正在回复...'
                : isConfigured
                  ? settings.model
                  : '未配置 API'}
            </Typography>
          </Box>
        </HeaderLeft>
        <IconButton edge="end" size="small" onClick={() => setDrawerOpen(true)}>
          <MenuRoundedIcon />
        </IconButton>
      </Header>

      <MessageList
        messages={state.messages}
        isProcessing={state.isProcessing}
      />

      <ChatInput
        onSend={handleSend}
        disabled={state.isProcessing}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          onClose={() => setError(null)}
          variant="filled"
          sx={{ borderRadius: 3, '& .MuiAlert-icon': { alignItems: 'center' } }}
        >
          {error}
        </Alert>
      </Snackbar>

      <ConversationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Layout>
  );
}
