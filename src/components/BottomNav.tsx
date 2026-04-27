import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import type { PageView } from '../types';

const Nav = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: '4px 8px',
  paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
  backgroundColor: theme.palette.background.default,
  borderTop: '1px solid',
  borderColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.06)',
}));

const NavItem = styled('button')<{ active: number }>(({ theme, active }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: '4px 24px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  borderRadius: 16,
  transition: 'all 0.2s ease',
  WebkitTapHighlightColor: 'transparent',
  minWidth: 80,
}));

const IconWrap = styled(Box)<{ active: number }>(({ theme, active }) => ({
  width: 52,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 17,
  transition: 'all 0.2s ease',
  transform: active ? 'scale(1)' : 'scale(0.85)',
  backgroundColor: active
    ? theme.palette.mode === 'dark'
      ? 'rgba(208,188,255,0.20)'
      : 'rgba(103,80,164,0.15)'
    : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.10)'
      : 'rgba(0,0,0,0.06)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 24,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: 'all 0.2s ease',
  },
}));

interface Props {
  activePage: PageView;
  onPageChange: (page: PageView) => void;
}

const items: { key: PageView; label: string; icon: typeof ChatRoundedIcon }[] = [
  { key: 'chat', label: '聊天', icon: ChatRoundedIcon },
  { key: 'settings', label: '设置', icon: SettingsRoundedIcon },
];

export default function BottomNav({ activePage, onPageChange }: Props) {
  return (
    <Nav>
      {items.map((item) => {
        const isActive = activePage === item.key;
        const Icon = item.icon;
        return (
          <NavItem
            key={item.key}
            active={isActive ? 1 : 0}
            onClick={() => onPageChange(item.key)}
          >
            <IconWrap active={isActive ? 1 : 0}>
              <Icon />
            </IconWrap>
            <Typography
              variant="caption"
              sx={{
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'primary.main' : 'text.secondary',
                fontSize: isActive ? '0.72rem' : '0.65rem',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Typography>
          </NavItem>
        );
      })}
    </Nav>
  );
}
