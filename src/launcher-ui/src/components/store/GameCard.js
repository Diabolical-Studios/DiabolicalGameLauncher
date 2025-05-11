import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardMedia, Typography, Box, CardContent, CardActionArea } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../../theme/colors';
import ImageButton from '../button/ImageButton';
import { VersionChip } from './VersionChip';

const GameCard = styled(Card)(({ size = 'normal' }) => ({
  position: 'relative',
  height: size === 'large' ? '400px' : size === 'small' ? '190px' : '200px',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  transformOrigin: 'center center',
  '&:hover': {
    transform: 'scale(1.03)',
    zIndex: 1,
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
    '& .game-title': {
      transition: 'all 0.2s ease-in-out',
      transform: 'translateY(-46px)',
    },
    '& .add-library-button': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

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
  transition: 'all 0.3s ease-in-out',
  '.add-library-button': {
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'all 0.2s ease-in-out',
  },
  '.MuiCard-root:hover & .add-library-button': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

const GameTitle = styled(Typography)({
  transition: 'transform 0.3s ease-in-out',
  transform: 'translateY(0)',
  lineHeight: '1',
});

export const GameCardComponent = ({
  game,
  size,
  onPlay,
  installedGames,
  isRunning,
  libraryGames,
  onLibraryUpdate,
}) => {
  const navigate = useNavigate();
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const isInLibrary = libraryGames.includes(game.game_id);

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

  if (!game) return null;

  const handleButtonClick = async () => {
    if (isRunning) {
      window.electronAPI.stopGame(game.game_id);
    } else {
      try {
        setIsAddingToLibrary(true);
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
              version: game.version || '1.0.0',
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
      } finally {
        setIsAddingToLibrary(false);
      }
    }
  };

  return (
    <GameCard size={size}>
      {game.version && <VersionChip label={`v${game.version}`} />}
      <StyledCardMedia
        component="img"
        image={game.background_image_url || ''}
        alt={game.game_name}
      />
      <CardOverlay>
        <GameTitle
          className="game-title"
          variant="h6"
          sx={{
            color: colors.text,
            textShadow: '0 4px 4px rgba(0,0,0,0.5)',
            fontWeight: 600,
          }}
        >
          {game.game_name}
        </GameTitle>
        {isInLibrary ? (
          <Link to={`/library?game=${game.game_id}`} style={{ textDecoration: 'none' }}>
            <ImageButton
              className="add-library-button"
              text="View in Library"
              icon={require('@mui/icons-material/Visibility').default}
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                minWidth: '140px',
                padding: '6px 16px',
              }}
            />
          </Link>
        ) : (
          <ImageButton
            className="add-library-button"
            text={isRunning ? 'Stop' : isAddingToLibrary ? 'Adding...' : 'Add to Library'}
            icon={
              isRunning
                ? require('@mui/icons-material/Stop').default
                : require('@mui/icons-material/Add').default
            }
            onClick={handleButtonClick}
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              minWidth: '140px',
              padding: '6px 16px',
            }}
          />
        )}
      </CardOverlay>
    </GameCard>
  );
};
