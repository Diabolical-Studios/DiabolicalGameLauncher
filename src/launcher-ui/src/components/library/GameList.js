import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { colors } from '../../theme/colors';

export const GameList = ({
  games,
  selectedGame,
  onGameSelect,
  installedGameIds,
  gameUpdates,
  onContextMenu,
  runningGames = [],
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        bgcolor: 'transparent',
        border: 'none',
        borderRadius: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
      }}
    >
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 0,
          m: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {games.map(game => {
          const isInstalled = installedGameIds.includes(game.game_id);
          const hasUpdate = gameUpdates[game.game_id] !== undefined;
          const isRunning = runningGames.includes(game.game_id);

          return (
            <ListItem
              key={game.game_id}
              button
              selected={selectedGame?.game_id === game.game_id}
              onClick={() => onGameSelect(game)}
              onContextMenu={e => onContextMenu(e, game)}
              sx={{
                gap: 2,
                borderTop: `1px solid ${colors.border}`,
                p: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                <SportsEsportsIcon sx={{ color: isRunning ? colors.primary : colors.text }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: isRunning ? colors.primary : hasUpdate ? colors.update : colors.text,
                        fontWeight: selectedGame?.game_id === game.game_id ? 600 : 400,
                        opacity: isInstalled ? 1 : 0.3,
                      }}
                    >
                      {game.game_name}
                    </Typography>
                    {hasUpdate && (
                      <Chip
                        label="Update"
                        size="small"
                        sx={{
                          backgroundColor: colors.update,
                          color: colors.text,
                          height: '20px',
                          fontSize: '0.75rem',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={null}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
