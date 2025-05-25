import React from 'react';
import { Box, Typography } from '@mui/material';
import InfiniteGameScroller from '../InfiniteGameScroller';
import InfiniteGameSkeleton from '../skeleton/InfiniteScrollerSkeleton';

const TeamGamesTab = ({ loadingGames, errorGames, games }) => {
  if (loadingGames) {
    return <InfiniteGameSkeleton />;
  }

  if (errorGames) {
    return (
      <Typography color="error" variant="body2">
        {errorGames}
      </Typography>
    );
  }

  return (
    <Box sx={{ minHeight: 80, width: '100%' }}>
      <InfiniteGameScroller games={games} style={{ width: '100%' }} />
    </Box>
  );
};

export default TeamGamesTab;
