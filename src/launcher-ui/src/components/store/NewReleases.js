import React from 'react';
import { Box, Grid, Typography, Grow } from '@mui/material';
import { colors } from '../../theme/colors';
import { GameCardComponent } from './GameCard';

export const NewReleases = ({ games, libraryGames, runningGames, onLibraryUpdate }) => {
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
        New Releases
      </Typography>
      <Grid container spacing={2}>
        {games.map((game, index) => (
          <Grid item xs={12} sm={6} md={3} key={game.game_id}>
            <Grow in={true} timeout={800 + index * 100}>
              <Box>
                <GameCardComponent
                  game={game}
                  libraryGames={libraryGames}
                  isRunning={!!runningGames[game.game_id]}
                  onLibraryUpdate={onLibraryUpdate}
                />
              </Box>
            </Grow>
          </Grid>
        ))}
      </Grid>
    </>
  );
};
