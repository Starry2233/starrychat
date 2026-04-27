import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Fab } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import KeyboardCommandKeyRoundedIcon from '@mui/icons-material/KeyboardCommandKeyRounded';

const InputContainer = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
  backgroundColor: theme.palette.background.default,
  borderTop: '1px solid',
  borderColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.06)',
}));

const InputRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: 8,
});

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <InputContainer>
      <InputRow>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          placeholder="输入消息..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px !important',
              padding: '8px 16px',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : '#F3EFF7',
            },
            '& .MuiOutlinedInput-input': {
              padding: '4px 0',
              fontSize: '0.9375rem',
            },
          }}
        />
        <Fab
          color="primary"
          size="medium"
          disabled={!text.trim() || disabled}
          onClick={handleSend}
          sx={{
            flexShrink: 0,
            boxShadow: text.trim() ? '0 4px 12px rgba(103,80,164,0.35)' : 'none',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(103,80,164,0.45)',
            },
          }}
        >
          <SendRoundedIcon />
        </Fab>
      </InputRow>
    </InputContainer>
  );
}
