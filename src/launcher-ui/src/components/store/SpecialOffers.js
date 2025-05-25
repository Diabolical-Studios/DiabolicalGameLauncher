import React from 'react';
import { Box, Grid, Typography, Grow } from '@mui/material';
import { colors } from '../../theme/colors';
import { GameCardComponent } from './GameCard';

export const SpecialOffers = ({ games, libraryGames, runningGames, onLibraryUpdate }) => {
  return (
    <>
      <Typography
        variant="h5"
        sx={{
          color: colors.text,
          mb: 2,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Special Offers
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          width: '100%',
          marginBottom: 3,
        }}
      >
        {/* Main Special Offer - Large Card */}
        <Box sx={{ width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {games[0] && (
            <Grow in={true} timeout={600}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <GameCardComponent
                  game={games[0]}
                  size="large"
                  libraryGames={libraryGames}
                  isRunning={!!runningGames[games[0].game_id]}
                  onLibraryUpdate={onLibraryUpdate}
                  style={{ width: '100%', height: '100%', flex: 1 }}
                />
              </Box>
            </Grow>
          )}
        </Box>
        {/* 2x2 Grid of 4 games */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 2,
            width: '100%',
            height: '-webkit-fill-available',
            minHeight: 0,
          }}
        >
          {games.slice(1, 5).map(
            (game, index) =>
              game && (
                <Grow in={true} timeout={700 + index * 100} key={game.game_id}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <GameCardComponent
                      game={game}
                      size="small"
                      libraryGames={libraryGames}
                      isRunning={!!runningGames[game.game_id]}
                      onLibraryUpdate={onLibraryUpdate}
                      style={{ width: '100%', height: '100%', flex: 1 }}
                    />
                  </Box>
                </Grow>
              )
          )}
        </Box>
      </Box>
    </>
  );
};
