import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { useConversations } from '../context/ConversationContext';

const DRAWER_WIDTH = 320;

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 16px 8px',
  paddingTop: 'max(16px, env(safe-area-inset-top))',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    maxWidth: '85vw',
    backgroundColor: theme.palette.background.default,
    borderLeft: '1px solid',
    borderColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.06)',
  },
}));

const NewChatBtn = styled(Button)(({ theme }) => ({
  borderRadius: 14,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: '0.8125rem',
  textTransform: 'none',
  gap: 6,
}));

const ConvItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 12,
  margin: '2px 8px',
  padding: '8px 12px',
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.04)',
  },
}));

const ConvTitle = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const ConvTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: 1,
}));

function formatRelTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ConversationDrawer({ open, onClose }: Props) {
  const {
    conversations,
    currentId,
    createConversation,
    deleteConversation,
    renameConversation,
    switchConversation,
    exportConversation,
  } = useConversations();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuConvId, setMenuConvId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, convId: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuConvId(convId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuConvId(null);
  };

  const handleRenameStart = () => {
    const conv = conversations.find((c) => c.id === menuConvId);
    if (!conv) return;
    setRenameText(conv.title);
    setRenameTarget(menuConvId);
    handleMenuClose();
  };

  const handleRenameConfirm = () => {
    if (renameTarget && renameText.trim()) {
      renameConversation(renameTarget, renameText.trim());
    }
    setRenameTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteConversation(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleNew = () => {
    createConversation();
    onClose();
  };

  const handleSwitch = (id: string) => {
    if (id !== currentId) {
      switchConversation(id);
    }
    onClose();
  };

  return (
    <>
      <StyledDrawer anchor="right" open={open} onClose={onClose}>
        <DrawerHeader>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            对话
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <NewChatBtn
              variant="contained"
              size="small"
              onClick={handleNew}
              sx={{ borderRadius: 14 }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
              新建
            </NewChatBtn>
            <IconButton size="small" onClick={onClose}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </DrawerHeader>

        <List sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          {conversations.map((conv) => {
            const isCurrent = conv.id === currentId;
            return (
              <ConvItem
                key={conv.id}
                selected={isCurrent}
                onClick={() => handleSwitch(conv.id)}
                sx={(theme) => ({
                  backgroundColor: isCurrent
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(208,188,255,0.10)'
                      : 'rgba(103,80,164,0.08)'
                    : 'transparent',
                })}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {conv.isProcessing ? (
                    <CircularProgress size={18} thickness={4} sx={{ color: 'primary.main' }} />
                  ) : (
                    <ChatOutlinedIcon sx={{ fontSize: 18, color: isCurrent ? 'primary.main' : 'text.secondary' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={<ConvTitle>{conv.title}</ConvTitle>}
                  secondary={<ConvTime>{formatRelTime(conv.updatedAt)}</ConvTime>}
                  sx={{ my: 0 }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, conv.id)}
                  sx={{ ml: 0.5, opacity: 0.6 }}
                >
                  <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </ConvItem>
            );
          })}
        </List>
      </StyledDrawer>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { minWidth: 150, py: 0.5 },
          },
        }}
      >
        <MenuItem onClick={handleRenameStart} sx={{ borderRadius: 2, mx: 0.5, gap: 1.5, py: 1 }}>
          <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">重命名</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => { if (menuConvId) exportConversation(menuConvId); handleMenuClose(); }}
          sx={{ borderRadius: 2, mx: 0.5, gap: 1.5, py: 1 }}
        >
          <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">导出</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => { setDeleteTarget(menuConvId); handleMenuClose(); }}
          sx={{ borderRadius: 2, mx: 0.5, gap: 1.5, py: 1, color: 'error.main' }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">删除</Typography>
        </MenuItem>
      </Menu>

      {/* Rename dialog */}
      <Dialog
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        slotProps={{ paper: { sx: { px: 0.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>重命名对话</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            value={renameText}
            onChange={(e) => setRenameText(e.target.value)}
            placeholder="输入新名称"
            variant="outlined"
            size="small"
            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); }}
            sx={{
              mt: 0.5,
              '& .MuiOutlinedInput-root': { borderRadius: 3 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setRenameTarget(null)}>取消</Button>
          <Button variant="contained" onClick={handleRenameConfirm}>
            确认
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>删除对话</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            删除后将无法恢复，确定要删除吗？
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 3 }}>取消</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} sx={{ borderRadius: 3 }}>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
