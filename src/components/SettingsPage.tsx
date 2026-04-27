import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Switch,
  Alert,
  switchClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useSettings } from '../context/SettingsContext';

const Page = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 8px',
  paddingTop: 'max(12px, env(safe-area-inset-top))',
  backgroundColor: theme.palette.background.default,
  borderBottom: '1px solid',
  borderColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.04)',
}));

const ScrollArea = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 16px 24px',
  WebkitOverflowScrolling: 'touch',
});

const SectionCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : '#FFFFFF',
  borderRadius: 24,
  padding: '20px 20px 24px',
  marginBottom: 16,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 1px 4px rgba(0,0,0,0.3)'
    : '0 2px 8px rgba(0,0,0,0.06)',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 20,
}));

const SectionIcon = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #6750A4, #D14D6A)',
  color: '#FFFFFF',
  fontSize: 18,
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: 6,
  letterSpacing: '0.02em',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px !important',
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : '#F5F0FF',
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.08)'
        : '#F0EBFF',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 16px',
    fontSize: '0.9375rem',
  },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    fontSize: 20,
  },
}));

const StatusBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 12px',
  borderRadius: 20,
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(208,188,255,0.12)'
    : 'rgba(103,80,164,0.10)',
  color: theme.palette.primary.main,
  marginTop: 8,
}));

const SwitchRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 0',
});

// ─── Material 3 Switch ──────────────────────────────────────

const M3Switch = styled(Switch)(({ theme }) => ({
  width: 52,
  height: 32,
  padding: 0,
  overflow: 'visible',
  [`& .${switchClasses.switchBase}`]: {
    padding: 0,
    top: 4,
    left: 4,
    [`&.${switchClasses.checked}`]: {
      transform: 'translateX(20px)',
      [`& + .${switchClasses.track}`]: {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 'none',
      },
      [`& .${switchClasses.thumb}`]: {
        backgroundColor: '#FFFFFF',
      },
    },
  },
  [`& .${switchClasses.thumb}`]: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? '#939094' : '#79747E',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  [`& .${switchClasses.track}`]: {
    borderRadius: 16,
    height: 32,
    width: 52,
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : '#E7E0EC',
    opacity: 1,
    border: '2px solid',
    borderColor: theme.palette.mode === 'dark' ? '#938F99' : '#79747E',
    boxSizing: 'border-box',
  },
}));

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings, isConfigured } = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: 'apiUrl' | 'model' | 'apiKey', value: string) => {
    updateSettings({ [field]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Page>
      <Header>
        <IconButton onClick={onBack} size="small" sx={{ color: 'text.primary' }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>设置</Typography>
        {isConfigured && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
            <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
              已配置
            </Typography>
          </Box>
        )}
      </Header>

      <ScrollArea>
        {/* Model Configuration */}
        <SectionCard>
          <SectionHeader>
            <SectionIcon>🤖</SectionIcon>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              模型配置
            </Typography>
          </SectionHeader>

          <Box sx={{ mb: 2.5 }}>
            <FieldLabel>API 地址</FieldLabel>
            <StyledTextField
              fullWidth
              placeholder="https://api.openai.com/v1"
              value={settings.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              variant="outlined"
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', pl: 1 }}>
              兼容 OpenAI 格式的 API 地址
            </Typography>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <FieldLabel>模型</FieldLabel>
            <StyledTextField
              fullWidth
              placeholder="gpt-4o"
              value={settings.model}
              onChange={(e) => handleChange('model', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ mb: 1 }}>
            <FieldLabel>API Key</FieldLabel>
            <StyledTextField
              fullWidth
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowKey(!showKey)}
                      edge="end"
                      sx={{ mr: 0.5 }}
                    >
                      {showKey ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  ),
                },
              }}
            />
          </Box>

          {saved && (
            <StatusBadge>
              <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
              配置已保存
            </StatusBadge>
          )}
        </SectionCard>

        {/* Display Settings */}
        <SectionCard>
          <SectionHeader>
            <SectionIcon>🎨</SectionIcon>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              显示设置
            </Typography>
          </SectionHeader>

          <SwitchRow>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                显示思考过程
              </Typography>
              <Typography variant="caption" color="text.secondary">
                如果 AI 支持，显示模型的推理步骤
              </Typography>
            </Box>
            <M3Switch
              checked={settings.showThinking}
              onChange={(e) => updateSettings({ showThinking: e.target.checked })}
            />
          </SwitchRow>
        </SectionCard>

        {/* About */}
        <SectionCard>
          <SectionHeader>
            <SectionIcon>✨</SectionIcon>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              关于
            </Typography>
          </SectionHeader>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            SkillHub Chat
          </Typography>
          <Typography variant="caption" color="text.secondary">
            基于 Material 3 Expressive 设计 · 版本 1.0.0
          </Typography>
        </SectionCard>
      </ScrollArea>
    </Page>
  );
}
