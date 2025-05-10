import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardMedia, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../../theme/colors';
import ImageButton from '../button/ImageButton';
import { VersionChip } from './VersionChip';

const FeaturedCard = styled(Card)({
  position: 'relative',
  height: '400px',
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
  '&:hover': {
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
  },
});

const StyledCardMedia = styled(CardMedia)({
  height: '100%',
  transition: 'transform 0.4s ease-in-out',
});

const CardOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
  padding: '16px',
});

export const FeaturedGames = ({ games, libraryGames, runningGames, onLibraryUpdate }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (games.length === 0 || isHovering) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex((currentIndex + 1) % games.length);
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [games.length, currentIndex, isHovering]);

  return (
    <Box
      sx={{ position: 'relative', mb: 3, height: '400px' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {games.map((game, index) => (
        <Box
          key={game.game_id}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            zIndex: index === currentIndex ? 1 : 0,
          }}
        >
          <FeaturedCard>
            {game.version && <VersionChip label={`v${game.version}`} />}
            <StyledCardMedia
              component="img"
              image={game.background_image_url || ''}
              alt={game.game_name}
            />
            <CardOverlay>
              <Typography
                variant="h3"
                sx={{
                  color: colors.text,
                  mb: 1,
                  textShadow: '0 4px 4px rgba(0,0,0,0.5)',
                  fontWeight: 600,
                }}
              >
                {game.game_name}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.text,
                  mb: 2,
                  maxWidth: '600px',
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}
              >
                {game.description}
              </Typography>
              <ImageButton
                text={
                  runningGames[game.game_id]
                    ? 'Stop'
                    : libraryGames.includes(game.game_id)
                      ? 'Go to Library'
                      : 'Add to Library'
                }
                icon={
                  runningGames[game.game_id]
                    ? require('@mui/icons-material/Stop').default
                    : libraryGames.includes(game.game_id)
                      ? require('@mui/icons-material/LibraryBooks').default
                      : require('@mui/icons-material/Add').default
                }
                onClick={async () => {
                  if (runningGames[game.game_id]) {
                    window.electronAPI.stopGame(game.game_id);
                  } else if (libraryGames.includes(game.game_id)) {
                    navigate('/library');
                  } else {
                    try {
                      const sessionID = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('sessionID='))
                        ?.split('=')[1];

                      if (!sessionID) {
                        throw new Error(
                          'No session ID found. Please log in to add games to your library.'
                        );
                      }

                      const response = await fetch('/add-to-library', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          SessionID: sessionID,
                        },
                        body: JSON.stringify({
                          game_id: game.game_id,
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to add game to library');
                      }

                      if (window.electronAPI) {
                        window.electronAPI.showCustomNotification(
                          'Game Added',
                          'Game has been added to your library!'
                        );
                      }

                      onLibraryUpdate(prev => [...prev, game.game_id]);
                    } catch (err) {
                      console.error('Error adding game to library:', err);
                      if (window.electronAPI) {
                        window.electronAPI.showCustomNotification(
                          'Add to Library Failed',
                          err.message || 'Could not add game to library'
                        );
                      }
                    }
                  }
                }}
                style={{ padding: '12px 48px' }}
              />
            </CardOverlay>
          </FeaturedCard>
        </Box>
      ))}
      <Box
        sx={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 2,
        }}
        className="featured-progress-bars"
      >
        {games.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: '40px',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              },
            }}
            onClick={() => {
              setCurrentIndex(index);
              setProgress(0);
            }}
          >
            {index === currentIndex && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: colors.text,
                  transition: 'width 0.05s linear',
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
