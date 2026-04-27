import { createTheme } from '@mui/material/styles';

// ─── Shared tokens ──────────────────────────────────────────

const lightTokens = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  tertiary: '#D14D6A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD9E1',
  onTertiaryContainer: '#3B0719',
  error: '#B3261E',
  onError: '#FFFFFF',
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
};

const darkTokens = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  tertiary: '#F2B8B5',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD9E1',
  error: '#F2B8B5',
  onError: '#601410',
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
};

const typography = {
  fontFamily: '"Noto Sans SC", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
  h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
  h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
  h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
  subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.01em' },
  subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.01em' },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0.02em' },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0.02em' },
  button: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.01em', textTransform: 'none' },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.03em' },
  overline: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.08em', textTransform: 'uppercase' },
};

// ─── Theme factory ──────────────────────────────────────────

function createAppTheme(mode: 'light' | 'dark') {
  const t = mode === 'light' ? lightTokens : darkTokens;

  return createTheme({
    palette: {
      mode,
      primary: { main: t.primary, contrastText: t.onPrimary },
      secondary: { main: t.secondary, contrastText: t.onSecondary },
      error: { main: t.error, contrastText: t.onError },
      background: { default: t.background, paper: t.surface },
      text: { primary: t.onBackground, secondary: t.onSurfaceVariant },
    },
    typography,
    shape: { borderRadius: 20 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: t.background,
            color: t.onBackground,
            fontFamily: '"Noto Sans SC", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: '10px 24px',
            fontWeight: 600,
          },
          contained: {
            boxShadow: mode === 'dark'
              ? '0 2px 6px rgba(0,0,0,0.4)'
              : '0 2px 6px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: mode === 'dark'
                ? '0 4px 12px rgba(0,0,0,0.5)'
                : '0 4px 12px rgba(0,0,0,0.2)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 24,
              backgroundColor: t.surfaceVariant,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: t.outline,
              },
              '&.Mui-focused fieldset': {
                borderColor: t.primary,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.4)'
              : '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-thumb': {
              boxShadow: mode === 'dark'
                ? '0 1px 3px rgba(0,0,0,0.4)'
                : '0 1px 3px rgba(0,0,0,0.2)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiAlert-filled': {
              borderRadius: 16,
            },
          },
        },
      },
    },
  });
}

export const theme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
