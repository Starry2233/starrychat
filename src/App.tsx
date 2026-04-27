import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMemo } from 'react';
import { Box } from '@mui/material';
import { theme, darkTheme } from './theme';
import { SettingsProvider } from './context/SettingsContext';
import { ConversationProvider } from './context/ConversationContext';
import ChatLayout from './components/ChatLayout';
import BottomNav from './components/BottomNav';
import SettingsPage from './components/SettingsPage';
import type { PageView } from './types';

function AppContent() {
  const [page, setPage] = useState<PageView>('chat');

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxWidth: 480,
      mx: 'auto',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: (t) => t.palette.mode === 'dark'
        ? 'none'
        : '0 0 40px rgba(0,0,0,0.04)',
    }}>
      <Box sx={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {page === 'chat' ? <ChatLayout /> : <SettingsPage onBack={() => setPage('chat')} />}
      </Box>

      <BottomNav activePage={page} onPageChange={setPage} />
    </Box>
  );
}

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const activeTheme = useMemo(() => (prefersDark ? darkTheme : theme), [prefersDark]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <SettingsProvider>
        <ConversationProvider>
          <AppContent />
        </ConversationProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
