import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { colors } from '../../theme/colors';

export const GameProperties = ({ open, onClose, game, properties, onPropertiesChange, onSave }) => {
  if (!game) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          border: `1px solid ${colors.border}`,
        },
      }}
    >
      <DialogTitle sx={{ color: colors.text }}>Game Properties - {game.game_name}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: colors.text }}>Branch</InputLabel>
            <Select
              value={properties.branch}
              onChange={e => onPropertiesChange('branch', e.target.value)}
              label="Branch"
              sx={{
                color: colors.text,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.border,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.button,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.button,
                },
              }}
            >
              <MenuItem value="latest">Latest</MenuItem>
              <MenuItem value="beta">Beta</MenuItem>
              <MenuItem value="alpha">Alpha</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ color: colors.text }}>Language</InputLabel>
            <Select
              value={properties.language}
              onChange={e => onPropertiesChange('language', e.target.value)}
              label="Language"
              sx={{
                color: colors.text,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.border,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.button,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.button,
                },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="it">Italian</MenuItem>
              <MenuItem value="pt">Portuguese</MenuItem>
              <MenuItem value="ru">Russian</MenuItem>
              <MenuItem value="zh">Chinese</MenuItem>
              <MenuItem value="ja">Japanese</MenuItem>
              <MenuItem value="ko">Korean</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Download Location"
            value={properties.downloadLocation}
            onChange={e => onPropertiesChange('downloadLocation', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: colors.text,
                '& fieldset': {
                  borderColor: colors.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.button,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.button,
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.text,
              },
            }}
          />

          <TextField
            label="Launch Options"
            value={properties.launchOptions}
            onChange={e => onPropertiesChange('launchOptions', e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: colors.text,
                '& fieldset': {
                  borderColor: colors.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.button,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.button,
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.text,
              },
            }}
          />

          <TextField
            label="Notes"
            value={properties.notes}
            onChange={e => onPropertiesChange('notes', e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: colors.text,
                '& fieldset': {
                  borderColor: colors.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.button,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.button,
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.text,
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: colors.text,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          sx={{
            bgcolor: colors.button,
            color: colors.text,
            '&:hover': {
              bgcolor: colors.buttonHover,
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
