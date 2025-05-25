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

  const handleAddToLibrary = async game => {
    try {
      const sessionID = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionID='))
        ?.split('=')[1];

      if (!sessionID) {
        // Fallback: Add to localStorage library
        let localLibrary = [];
        try {
          localLibrary = JSON.parse(localStorage.getItem('localLibrary')) || [];
        } catch (e) {
          localLibrary = [];
        }
        if (!localLibrary.includes(game.game_id)) {
          // Store complete game details in localStorage
          const gameDetails = {
            game_id: game.game_id,
            game_name: game.game_name,
            version: game.version || 'unknown',
            description: game.description || '',
            background_image_url: game.background_image_url || '',
            banner_image_url: game.banner_image_url || '',
            playtime: 0,
            achievements: { completed: 0, total: 0 },
            disk_usage: '0 MB',
            last_played: null,
            properties: {
              branch: 'latest',
              language: 'en',
              downloadLocation: '',
              launchOptions: '',
              notes: '',
            },
          };

          // Store in localLibrary array
          localLibrary.push(game.game_id);
          localStorage.setItem('localLibrary', JSON.stringify(localLibrary));

          // Store game details separately
          const gameDetailsKey = `game_${game.game_id}`;
          localStorage.setItem(gameDetailsKey, JSON.stringify(gameDetails));

          // Update cached games
          if (window.electronAPI?.cacheGamesLocally) {
            let cachedGames = [];
            try {
              cachedGames = await window.electronAPI.getCachedGames();
            } catch (e) {
              cachedGames = [];
            }
            if (!cachedGames.find(g => g.game_id === game.game_id)) {
              cachedGames.push(gameDetails);
              window.electronAPI.cacheGamesLocally(cachedGames);
            }
          }

          if (window.electronAPI) {
            window.electronAPI.showCustomNotification(
              'Game Added',
              'Game has been added to your local library!'
            );
          }
          // Update the library state immediately
          onLibraryUpdate([...localLibrary]);
        } else {
          if (window.electronAPI) {
            window.electronAPI.showCustomNotification(
              'Already in Library',
              'This game is already in your local library.'
            );
          }
        }
        return;
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

      // Store complete game details in localStorage even for online mode
      const gameDetails = {
        game_id: game.game_id,
        game_name: game.game_name,
        version: game.version || 'unknown',
        description: game.description || '',
        background_image_url: game.background_image_url || '',
        banner_image_url: game.banner_image_url || '',
        playtime: 0,
        achievements: { completed: 0, total: 0 },
        disk_usage: '0 MB',
        last_played: null,
        properties: {
          branch: 'latest',
          language: 'en',
          downloadLocation: '',
          launchOptions: '',
          notes: '',
        },
      };

      // Store game details
      const gameDetailsKey = `game_${game.game_id}`;
      localStorage.setItem(gameDetailsKey, JSON.stringify(gameDetails));

      // Update cached games
      if (window.electronAPI?.cacheGamesLocally) {
        let cachedGames = [];
        try {
          cachedGames = await window.electronAPI.getCachedGames();
        } catch (e) {
          cachedGames = [];
        }
        if (!cachedGames.find(g => g.game_id === game.game_id)) {
          cachedGames.push(gameDetails);
          window.electronAPI.cacheGamesLocally(cachedGames);
        }
      }

      if (window.electronAPI) {
        window.electronAPI.showCustomNotification(
          'Game Added',
          'Game has been added to your library!'
        );
      }

      // Get current library games and add the new one
      const currentLibrary = JSON.parse(localStorage.getItem('localLibrary')) || [];
      const updatedLibrary = [...currentLibrary, game.game_id];
      // Update the library state immediately
      onLibraryUpdate(updatedLibrary);
    } catch (err) {
      console.error('Error adding game to library:', err);
      if (window.electronAPI) {
        window.electronAPI.showCustomNotification(
          'Add to Library Failed',
          err.message || 'Could not add game to library'
        );
      }
    }
  };

  // Add a useEffect to sync with localStorage
  useEffect(() => {
    const syncWithLocalStorage = () => {
      try {
        const localLibrary = JSON.parse(localStorage.getItem('localLibrary')) || [];
        if (JSON.stringify(localLibrary) !== JSON.stringify(libraryGames)) {
          onLibraryUpdate(localLibrary);
        }
      } catch (e) {
        console.error('Error syncing with localStorage:', e);
      }
    };

    syncWithLocalStorage();
  }, [libraryGames, onLibraryUpdate]);

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
              sx={{
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.7)',
              }}
            />
            <CardOverlay>
              <Typography
                variant="h4"
                sx={{
                  color: colors.text,
                  textShadow: '0 4px 4px rgba(0,0,0,0.5)',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {game.game_name}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.text,
                  textShadow: '0 2px 2px rgba(0,0,0,0.5)',
                  mb: 4,
                  maxWidth: '600px',
                }}
              >
                {game.description}
              </Typography>
              <ImageButton
                text={
                  runningGames[game.game_id]
                    ? 'Stop'
                    : libraryGames.includes(game.game_id)
                      ? 'View in Library'
                      : 'Add to Library'
                }
                icon={
                  runningGames[game.game_id]
                    ? require('@mui/icons-material/Stop').default
                    : libraryGames.includes(game.game_id)
                      ? require('@mui/icons-material/LaunchRounded').default
                      : require('@mui/icons-material/Add').default
                }
                onClick={async () => {
                  if (runningGames[game.game_id]) {
                    window.electronAPI.stopGame(game.game_id);
                  } else if (libraryGames.includes(game.game_id)) {
                    navigate('/library');
                  } else {
                    await handleAddToLibrary(game);
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
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: colors.button,
            transition: 'width 0.05s linear',
          }}
        />
      </Box>
    </Box>
  );
};
