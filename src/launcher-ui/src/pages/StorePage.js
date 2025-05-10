import React, { useEffect, useMemo, useState, useCallback } from 'react';
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

  // Load library games from localStorage on mount
  useEffect(() => {
    const loadLibraryGames = () => {
      try {
        const localLibrary = JSON.parse(localStorage.getItem('localLibrary')) || [];
        setLibraryGames(localLibrary);
      } catch (e) {
        console.error('Error loading library games from localStorage:', e);
        setLibraryGames([]);
      }
    };

    loadLibraryGames();

    // Add event listener for storage changes
    const handleStorageChange = e => {
      if (e.key === 'localLibrary') {
        try {
          const newLibrary = JSON.parse(e.newValue) || [];
          setLibraryGames(newLibrary);
        } catch (err) {
          console.error('Error handling storage change:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update library games when they change
  const handleLibraryUpdate = useCallback(newLibraryGames => {
    if (!Array.isArray(newLibraryGames)) {
      console.error('Invalid library games update:', newLibraryGames);
      return;
    }
    setLibraryGames(newLibraryGames);
    localStorage.setItem('localLibrary', JSON.stringify(newLibraryGames));
  }, []);

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
      // 1. Try to load from localStorage first
      let localGames = [];
      try {
        localGames = JSON.parse(localStorage.getItem('localGames')) || [];
        if (localGames.length) {
          setGames(localGames);
        }
      } catch (e) {
        console.error('Error loading games from localStorage:', e);
      }

      // 2. Fetch latest games from API and update the list
      try {
        const response = await axios.get('/get-all-games');
        const freshGames = response.data;
        setGames(freshGames);

        // Store in localStorage
        localStorage.setItem('localGames', JSON.stringify(freshGames));
      } catch (err) {
        console.error('Error loading games:', err);
      }
    };

    loadGames();
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
            onLibraryUpdate={handleLibraryUpdate}
          />
        )}

        {/* Special Offers */}
        {!searchQuery && (
          <SpecialOffers
            games={specialOffers}
            libraryGames={libraryGames}
            runningGames={runningGames}
            onLibraryUpdate={handleLibraryUpdate}
          />
        )}

        {/* Search Results or New Releases */}
        {searchQuery ? (
          <NewReleases
            games={filteredGames}
            libraryGames={libraryGames}
            runningGames={runningGames}
            onLibraryUpdate={handleLibraryUpdate}
          />
        ) : (
          <NewReleases
            games={newReleases}
            libraryGames={libraryGames}
            runningGames={runningGames}
            onLibraryUpdate={handleLibraryUpdate}
          />
        )}
      </Container>
    </Box>
  );
};

export default StorePage;
