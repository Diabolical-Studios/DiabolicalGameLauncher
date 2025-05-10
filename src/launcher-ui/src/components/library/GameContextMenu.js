import React, { useEffect, useRef } from 'react';
import { Popover, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import StopIcon from '@mui/icons-material/Stop';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { colors } from '../../theme/colors';

export const GameContextMenu = ({
  anchorEl,
  onClose,
  game,
  isInstalled,
  isGameRunning,
  hasUpdate,
  onPlay,
  onDownload,
  onUpdate,
  onStop,
  onUninstall,
  onOpenFolder,
  onOpenProperties,
  onRemoveFromLibrary,
}) => {
  const paperRef = useRef(null);

  // Native-like context menu: close and re-dispatch click/contextmenu if outside
  useEffect(() => {
    if (!anchorEl) return;
    function handleEvent(e) {
      if (paperRef.current && !paperRef.current.contains(e.target)) {
        onClose();
        // Re-dispatch the event at the clicked element
        const evt = new e.constructor(e.type, e);
        setTimeout(() => e.target.dispatchEvent(evt), 0);
      }
    }
    document.addEventListener('mousedown', handleEvent, true);
    document.addEventListener('contextmenu', handleEvent, true);
    return () => {
      document.removeEventListener('mousedown', handleEvent, true);
      document.removeEventListener('contextmenu', handleEvent, true);
    };
  }, [anchorEl, onClose]);

  if (!game) return null;

  return (
    <Popover
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorEl ? { top: anchorEl.mouseY, left: anchorEl.mouseX } : undefined}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          border: `1px solid ${colors.border}`,
          minWidth: 200,
        },
        ref: paperRef,
      }}
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      style={{ pointerEvents: 'auto' }}
    >
      <Box sx={{ py: 1 }}>
        {isGameRunning ? (
          <MenuItem
            onClick={() => {
              onStop();
              onClose();
            }}
            sx={{
              color: colors.text,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <StopIcon sx={{ color: colors.text }} />
            </ListItemIcon>
            <ListItemText>Stop</ListItemText>
          </MenuItem>
        ) : isInstalled ? (
          <MenuItem
            onClick={() => {
              onPlay();
              onClose();
            }}
            sx={{
              color: colors.text,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <PlayArrowIcon sx={{ color: colors.text }} />
            </ListItemIcon>
            <ListItemText>Play</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onDownload();
              onClose();
            }}
            sx={{
              color: colors.text,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <DownloadIcon sx={{ color: colors.text }} />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}

        {hasUpdate && (
          <MenuItem
            onClick={() => {
              onUpdate();
              onClose();
            }}
            sx={{
              color: colors.text,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <UpdateIcon sx={{ color: colors.text }} />
            </ListItemIcon>
            <ListItemText>Update</ListItemText>
          </MenuItem>
        )}

        {isInstalled && (
          <>
            <MenuItem
              onClick={async () => {
                await onOpenFolder();
                onClose();
              }}
              sx={{
                color: colors.text,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <FolderIcon sx={{ color: colors.text }} />
              </ListItemIcon>
              <ListItemText>Open Folder</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                onOpenProperties();
                onClose();
              }}
              sx={{
                color: colors.text,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: colors.text }} />
              </ListItemIcon>
              <ListItemText>Properties</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                onUninstall();
                onClose();
              }}
              sx={{
                color: colors.text,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <DeleteIcon sx={{ color: colors.text }} />
              </ListItemIcon>
              <ListItemText>Uninstall</ListItemText>
            </MenuItem>
          </>
        )}

        {/* Remove from Library (always available) */}
        <MenuItem
          onClick={() => {
            if (onRemoveFromLibrary) onRemoveFromLibrary();
            onClose();
          }}
          sx={{
            color: '#ff5555',
            '&:hover': {
              backgroundColor: 'rgba(255, 85, 85, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <RemoveCircleOutlineIcon sx={{ color: '#ff5555' }} />
          </ListItemIcon>
          <ListItemText>Remove from Library</ListItemText>
        </MenuItem>
      </Box>
    </Popover>
  );
};
