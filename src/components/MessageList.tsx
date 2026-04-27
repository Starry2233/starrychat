import { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MessageBubble from './MessageBubble';
import { useSettings } from '../context/SettingsContext';
import type { ChatMessage } from '../types';

const ListContainer = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '12px 0',
  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
});

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '0 32px',
  textAlign: 'center',
  gap: 16,
  animation: 'fadeIn 0.5s ease',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(12px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}));

interface Props {
  messages: ChatMessage[];
  isProcessing: boolean;
}

export default function MessageList({ messages, isProcessing }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <ListContainer>
        <EmptyState>
          <Typography
            variant="h4"
            sx={{
              background: 'linear-gradient(135deg, #6750A4, #D14D6A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.75rem',
            }}
          >
            SkillHub Chat
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 280 }}>
            开始一段与 AI 助手的对话吧
          </Typography>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      {messages.map((msg, idx) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isStreaming={isProcessing && idx === messages.length - 1 && msg.role === 'assistant'}
          showThinking={settings.showThinking}
        />
      ))}
      <div ref={bottomRef} />
    </ListContainer>
  );
}
