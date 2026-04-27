import { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import PsychologyRoundedIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { ChatMessage } from '../types';

const BubbleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '4px 16px',
  marginBottom: 4,
  animation: 'fadeIn 0.3s ease',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}));

const MAX_BUBBLE = '94%';

const UserBubble = styled(Paper)(({ theme }) => ({
  padding: '12px 20px',
  borderRadius: '20px 20px 4px 20px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  maxWidth: MAX_BUBBLE,
  overflowWrap: 'break-word',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
}));

const BubbleCard = styled(Box)(({ theme }) => ({
  maxWidth: MAX_BUBBLE,
  minWidth: 120,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}));

const AssistantContent = styled(Paper)(({ theme }) => ({
  padding: '12px 20px',
  borderRadius: '20px 20px 20px 4px',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : '#F5F0FF',
  color: theme.palette.text.primary,
  overflowWrap: 'break-word',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
}));

// ─── Thinking Block ──────────────────────────────────────────

const ThinkingBlock = styled(Box)(({ theme }) => ({
  borderRadius: '16px 16px 16px 4px',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(209,77,106,0.10)'
    : 'rgba(209,77,106,0.06)',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark'
    ? 'rgba(209,77,106,0.20)'
    : 'rgba(209,77,106,0.15)',
  overflow: 'hidden',
  marginBottom: 6,
}));

const ThinkingHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 14px',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
}));

const ThinkingLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const ThinkingContent = styled(Box)(({ theme }) => ({
  padding: '0 14px 10px 14px',
  fontSize: '0.8125rem',
  lineHeight: 1.7,
  color: theme.palette.text.secondary,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.65rem',
  color: theme.palette.text.secondary,
  marginTop: 4,
  opacity: 0.7,
  userSelect: 'none',
})) as typeof Typography;

// ─── Markdown ────────────────────────────────────────────────

const MarkdownContainer = styled(Box)(({ theme }) => ({
  fontSize: '0.9375rem',
  lineHeight: 1.7,
  '& > *:first-child': { marginTop: 0 },
  '& > *:last-child': { marginBottom: 0 },
  '& p': {
    margin: '6px 0',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: '14px 0 6px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  '& h1': { fontSize: '1.3rem' },
  '& h2': { fontSize: '1.15rem' },
  '& h3': { fontSize: '1.05rem' },
  '& ul, & ol': {
    margin: '6px 0',
    paddingLeft: 22,
  },
  '& li': {
    margin: '2px 0',
  },
  '& li > p': {
    margin: 0,
  },
  '& blockquote': {
    margin: '8px 0',
    padding: '6px 14px',
    borderLeft: '3px solid',
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.04)'
      : 'rgba(103,80,164,0.06)',
    borderRadius: '0 8px 8px 0',
    color: theme.palette.text.secondary,
  },
  '& code': {
    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
    fontSize: '0.8125rem',
    padding: '2px 6px',
    borderRadius: 6,
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.10)'
      : 'rgba(0,0,0,0.06)',
  },
  '& pre': {
    margin: '10px 0',
    padding: '14px 16px',
    borderRadius: 14,
    backgroundColor: theme.palette.mode === 'dark'
      ? '#0D0D0D'
      : '#F0EBF8',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  '& pre code': {
    padding: 0,
    backgroundColor: 'transparent',
    fontSize: '0.8125rem',
    lineHeight: 1.6,
    whiteSpace: 'pre',
  },
  '& table': {
    margin: '8px 0',
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '0.8125rem',
  },
  '& th, & td': {
    padding: '8px 12px',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(0,0,0,0.10)',
    textAlign: 'left',
  },
  '& th': {
    fontWeight: 600,
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(103,80,164,0.08)',
  },
  '& tr:nth-of-type(even)': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.02)'
      : 'rgba(0,0,0,0.02)',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    '&:hover': { opacity: 0.8 },
  },
  '& hr': {
    margin: '12px 0',
    border: 'none',
    height: 1,
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.08)',
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: 12,
    margin: '8px 0',
  },
  // Inline code in thinking content
  '& p > code, & li > code': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.10)'
      : 'rgba(103,80,164,0.10)',
    color: theme.palette.mode === 'dark'
      ? '#F2B8B5'
      : '#D14D6A',
  },
}));

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return `${d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
}

// ─── MathJax Markdown ────────────────────────────────────────

function MathMarkdown({ content }: { content: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([rootRef.current]).catch(() => {});
    }
  }, [content]);

  return (
    <MarkdownContainer ref={rootRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          math: ({ children }: any) => <div>{'$$'}{children}{'$$'}</div>,
          inlineMath: ({ children }: any) => <span>{'$'}{children}{'$'}</span>,
        } as any}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
}

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
  showThinking?: boolean;
}

export default function MessageBubble({ message, isStreaming, showThinking }: Props) {
  const isUser = message.role === 'user';
  const [thinkingOpen, setThinkingOpen] = useState(true);
  const hasThinking = showThinking && message.reasoning && message.reasoning.length > 0;

  return (
    <BubbleRow sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
        {isUser ? (
          <UserBubble elevation={0}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, wordBreak: 'break-word' }}>
              {message.content}
            </Typography>
          </UserBubble>
        ) : (
          <BubbleCard>
            {/* Thinking / Reasoning section */}
            {hasThinking && (
              <ThinkingBlock>
                <ThinkingHeader onClick={() => setThinkingOpen(!thinkingOpen)}>
                  <ThinkingLeft>
                    <PsychologyRoundedIcon sx={{ fontSize: 16, color: 'tertiary.main' }} />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: 'tertiary.main', fontSize: '0.75rem' }}
                    >
                      思考过程
                    </Typography>
                    {isStreaming && (
                      <CircularProgress size={12} thickness={5} sx={{ color: 'tertiary.main' }} />
                    )}
                  </ThinkingLeft>
                  {thinkingOpen ? (
                    <ExpandLessRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  ) : (
                    <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  )}
                </ThinkingHeader>
                {thinkingOpen && (
                  <ThinkingContent>
                    {message.reasoning}
                  </ThinkingContent>
                )}
              </ThinkingBlock>
            )}

            {/* Main content */}
            <AssistantContent elevation={0}>
              {isStreaming && !message.content ? (
                <Box component="span" sx={{ display: 'inline-flex', gap: 0.5, py: 0.5 }}>
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', animation: 'blink 1s ease-in-out infinite' }} />
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', animation: 'blink 1s ease-in-out infinite 0.2s' }} />
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', animation: 'blink 1s ease-in-out infinite 0.4s' }} />
                </Box>
              ) : (
                <MathMarkdown content={message.content} />
              )}
            </AssistantContent>
          </BubbleCard>
        )}
        <TimeLabel variant="caption">
          {formatTime(message.timestamp)}
        </TimeLabel>
      </Box>
    </BubbleRow>
  );
}
