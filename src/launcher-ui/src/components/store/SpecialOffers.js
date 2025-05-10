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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Main Special Offer */}
        <Grid item xs={12} md={6}>
          {games[0] && (
            <Grow in={true} timeout={600}>
              <Box>
                <GameCardComponent
                  game={games[0]}
                  size="large"
                  libraryGames={libraryGames}
                  isRunning={!!runningGames[games[0].game_id]}
                  onLibraryUpdate={onLibraryUpdate}
                />
              </Box>
            </Grow>
          )}
        </Grid>
        {/* Grid of 4 games */}
        <Grid item xs={12} md={6}>
          <Grid
            container
            spacing={2}
            sx={{
              height: '-webkit-fill-available',
              minHeight: '400px',
              '& .MuiGrid-item': {
                height: 'calc(50% - 8px)',
              },
            }}
          >
            {games.slice(1, 5).map(
              (game, index) =>
                game && (
                  <Grid item xs={6} key={game.game_id}>
                    <Grow in={true} timeout={700 + index * 100}>
                      <Box>
                        <GameCardComponent
                          game={game}
                          size="small"
                          libraryGames={libraryGames}
                          isRunning={!!runningGames[game.game_id]}
                          onLibraryUpdate={onLibraryUpdate}
                        />
                      </Box>
                    </Grow>
                  </Grid>
                )
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
