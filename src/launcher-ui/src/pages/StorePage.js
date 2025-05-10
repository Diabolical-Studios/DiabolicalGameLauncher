import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, TextField } from '@mui/material';
import { colors } from '../theme/colors';
import axios from 'axios';
import { FeaturedGames } from '../components/store/FeaturedGames';
import { SpecialOffers } from '../components/store/SpecialOffers';
import { NewReleases } from '../components/store/NewReleases';

const StorePage = () => {
  const [games, setGames] = useState([]);
  const [libraryGames, setLibraryGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [runningGames, setRunningGames] = useState({});

  // Memoize the filtered games based on search query
  const filteredGames = useMemo(() => {
    if (!searchQuery) return games;
    return games.filter(
      game =>
        game.game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  // Memoize the shuffled games to prevent re-randomization on re-renders
  const shuffledGames = useMemo(() => {
    if (filteredGames.length > 0) {
      return [...filteredGames].sort(() => Math.random() - 0.5);
    }
    return [];
  }, [filteredGames]);

  // Memoize featured games
  const featuredGames = useMemo(() => {
    return shuffledGames.slice(0, 3);
  }, [shuffledGames]);

  // Add a single set of listeners for game-started and game-stopped
  useEffect(() => {
    const handleGameStarted = startedGameId => {
      setRunningGames(prev => ({ ...prev, [startedGameId]: true }));
    };
    const handleGameStopped = stoppedGameId => {
      setRunningGames(prev => ({ ...prev, [stoppedGameId]: false }));
    };
    if (window.electronAPI) {
      window.electronAPI.onGameStarted(handleGameStarted);
      window.electronAPI.onGameStopped(handleGameStopped);
    }
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeGameStartedListener(handleGameStarted);
        window.electronAPI.removeGameStoppedListener(handleGameStopped);
      }
    };
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      try {
        // 2. Try live API first
        try {
          const response = await axios.get('/get-all-games');
          const freshGames = response.data;
          setGames(freshGames);

          // Cache games locally only in desktop environment
          if (window.electronAPI?.cacheGamesLocally) {
            window.electronAPI.cacheGamesLocally(freshGames);
          }
        } catch (error) {
          console.error('❌ Error fetching games from API:', error);

          // 3. Fallback to cached games if API fails (only in desktop environment)
          if (window.electronAPI?.getCachedGames) {
            try {
              const cachedGames = await window.electronAPI.getCachedGames();
              if (cachedGames.length > 0) {
                setGames(cachedGames);
                window.electronAPI?.showCustomNotification(
                  'Offline Mode',
                  'Showing cached games. Some features may be limited.'
                );
              }
            } catch (cacheErr) {
              console.error('Error loading cached games:', cacheErr);
            }
          }
        }
      } catch (err) {
        console.error('Error in loadGames:', err);
      }
    };

    loadGames();
  }, []);

  // Fetch library games
  useEffect(() => {
    const fetchLibraryGames = async () => {
      try {
        const sessionID = document.cookie
          .split('; ')
          .find(row => row.startsWith('sessionID='))
          ?.split('=')[1];

        if (!sessionID) {
          console.log('No session ID found, skipping library fetch');
          return;
        }

        const response = await fetch('/get-library-games', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            SessionID: sessionID,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch library games');
        }

        const data = await response.json();
        setLibraryGames(data.map(game => game.game_id));
      } catch (error) {
        console.error('Error fetching library games:', error);
      }
    };

    fetchLibraryGames();
  }, []);

  const specialOffers = shuffledGames.slice(3, 8);
  const newReleases = shuffledGames.slice(8);

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search games..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: colors.text,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
              '& .MuiInputBase-input': {
                padding: '12px 16px',
              },
            }}
          />
        </Box>

        {/* Featured Games */}
        {!searchQuery && featuredGames.length > 0 && (
          <FeaturedGames
            games={featuredGames}
            libraryGames={libraryGames}
            runningGames={runningGames}
            onLibraryUpdate={setLibraryGames}
          />
        )}

        {/* Special Offers */}
        {!searchQuery && (
          <SpecialOffers
            games={specialOffers}
            libraryGames={libraryGames}
            runningGames={runningGames}
            onLibraryUpdate={setLibraryGames}
          />
        )}

        {/* Search Results or New Releases */}
        {searchQuery ? (
          <NewReleases
            games={filteredGames}
            libraryGames={libraryGames}
            runningGames={runningGames}
            onLibraryUpdate={setLibraryGames}
          />
        ) : (
          <NewReleases
            games={newReleases}
            libraryGames={libraryGames}
            runningGames={runningGames}
            onLibraryUpdate={setLibraryGames}
          />
        )}
      </Container>
    </Box>
  );
};

export default StorePage;
