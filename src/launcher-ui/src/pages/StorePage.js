import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Chip,
  Container,
  Grid,
  Grow,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../theme/colors';
import axios from 'axios';
import ImageButton from '../components/button/ImageButton';

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
  // Show button when parent card is hovered
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

const VersionChip = styled(Chip)({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(5px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '2px',
  color: colors.text,
  height: '24px',
  fontSize: '0.75rem',
  zIndex: 2,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
});

const GameCardComponent = ({
  game,
  size,
  onDownload,
  onPlay,
  installedGames,
  isRunning,
  onDownloadProgress,
}) => {
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [isInstalled, setIsInstalled] = useState(installedGames.includes(game.game_id));
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isDownloading) return;
    // Only add listeners when downloading
    const handleDownloadProgress = progressData => {
      if (progressData.gameId === game.game_id) {
        setDownloadProgress(`${Math.round(progressData.percentage * 100)}%`);
        onDownloadProgress(game.game_id, `${Math.round(progressData.percentage * 100)}%`);
      }
    };

    const handleDownloadComplete = ({ gameId }) => {
      if (gameId === game.game_id) {
        setDownloadProgress(null);
        setIsInstalled(true);
        setIsDownloading(false);
      }
    };

    const handleGameUninstalled = uninstalledGameId => {
      if (uninstalledGameId === game.game_id) {
        setIsInstalled(false);
      }
    };

    window.electronAPI?.onDownloadProgress(handleDownloadProgress);
    window.electronAPI?.onDownloadComplete(handleDownloadComplete);
    window.electronAPI?.onGameUninstalled(handleGameUninstalled);

    return () => {
      window.electronAPI?.removeDownloadProgressListener(handleDownloadProgress);
    };
  }, [game.game_id, isDownloading, onDownloadProgress]);

  if (!game) return null;

  const handleButtonClick = () => {
    if (isRunning) {
      window.electronAPI.stopGame(game.game_id);
    } else if (isInstalled) {
      onPlay(game.game_id);
    } else {
      setIsDownloading(true);
      onDownload(game.game_id);
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
        <ImageButton
          className="add-library-button"
          text={downloadProgress || (isRunning ? 'Stop' : isInstalled ? 'Play' : 'Download')}
          icon={
            isRunning
              ? require('@mui/icons-material/Stop').default
              : isInstalled
                ? require('@mui/icons-material/PlayArrow').default
                : require('@mui/icons-material/Download').default
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
      </CardOverlay>
    </GameCard>
  );
};

const StorePage = () => {
  const [games, setGames] = useState([]);
  const [installedGames, setInstalledGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [downloadProgresses, setDownloadProgresses] = useState({});
  const [isHovering, setIsHovering] = useState(false);
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

  // Handle featured games transition and progress
  useEffect(() => {
    if (featuredGames.length === 0 || isHovering) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentFeaturedIndex((currentFeaturedIndex + 1) % featuredGames.length);
          return 0;
        }
        return prev + 1;
      });
    }, 50); // Update progress every 50ms

    return () => clearInterval(progressInterval);
  }, [featuredGames.length, currentFeaturedIndex, isHovering]);

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
        // 1. Load installed games FIRST (only in desktop environment)
        if (window.electronAPI) {
          try {
            const fetchedInstalledGames = await window.electronAPI.getInstalledGames();
            setInstalledGames(fetchedInstalledGames);
          } catch (err) {
            console.error('Error fetching installed games:', err);
            setInstalledGames([]);
          }
        }

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

  const handlePlayGame = async gameId => {
    try {
      await window.electronAPI.openGame(gameId);
    } catch (err) {
      console.error('Error opening game:', err);
    }
  };

  const handleDownloadGame = async gameId => {
    try {
      await window.electronAPI.downloadGame(gameId);
    } catch (err) {
      console.error('Error downloading game:', err);
    }
  };

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

        {/* New Featured Games Section */}
        {!searchQuery && featuredGames.length > 0 && (
          <Box
            sx={{ position: 'relative', mb: 3, height: '400px' }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {featuredGames.map((game, index) => (
              <Box
                key={game.game_id}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: index === currentFeaturedIndex ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: index === currentFeaturedIndex ? 1 : 0,
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
                        downloadProgresses[game.game_id] ||
                        (installedGames.includes(game.game_id) ? 'Play' : 'Download')
                      }
                      icon={
                        installedGames.includes(game.game_id)
                          ? require('@mui/icons-material/PlayArrow').default
                          : require('@mui/icons-material/Download').default
                      }
                      onClick={() => {
                        if (installedGames.includes(game.game_id)) {
                          handlePlayGame(game.game_id);
                        } else {
                          handleDownloadGame(game.game_id);
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
              {featuredGames.map((_, index) => (
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
                    setCurrentFeaturedIndex(index);
                    setProgress(0);
                  }}
                >
                  {index === currentFeaturedIndex && (
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
        )}

        {/* Special Offers */}
        {!searchQuery && (
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
                {specialOffers[0] && (
                  <Grow in={true} timeout={600}>
                    <Box>
                      <GameCardComponent
                        game={specialOffers[0]}
                        size="large"
                        onDownload={handleDownloadGame}
                        onPlay={handlePlayGame}
                        installedGames={installedGames}
                        isRunning={!!runningGames[specialOffers[0].game_id]}
                        onDownloadProgress={(gameId, progress) =>
                          setDownloadProgresses(prev => ({ ...prev, [gameId]: progress }))
                        }
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
                  {specialOffers.slice(1, 5).map(
                    (game, index) =>
                      game && (
                        <Grid item xs={6} key={game.game_id}>
                          <Grow in={true} timeout={700 + index * 100}>
                            <Box>
                              <GameCardComponent
                                game={game}
                                size="small"
                                onDownload={handleDownloadGame}
                                onPlay={handlePlayGame}
                                installedGames={installedGames}
                                isRunning={!!runningGames[game.game_id]}
                                onDownloadProgress={(gameId, progress) =>
                                  setDownloadProgresses(prev => ({ ...prev, [gameId]: progress }))
                                }
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
        )}

        {/* Search Results or New Releases */}
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
          {searchQuery ? 'Search Results' : 'New Releases'}
        </Typography>
        <Grid container spacing={2}>
          {(searchQuery ? filteredGames : newReleases).map((game, index) => (
            <Grid item xs={12} sm={6} md={3} key={game.game_id}>
              <Grow in={true} timeout={800 + index * 100}>
                <Box>
                  <GameCardComponent
                    game={game}
                    onDownload={handleDownloadGame}
                    onPlay={handlePlayGame}
                    installedGames={installedGames}
                    isRunning={!!runningGames[game.game_id]}
                    onDownloadProgress={(gameId, progress) =>
                      setDownloadProgresses(prev => ({ ...prev, [gameId]: progress }))
                    }
                  />
                </Box>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StorePage;
