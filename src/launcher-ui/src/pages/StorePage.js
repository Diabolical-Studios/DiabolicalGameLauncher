import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Grid,
    Button,
    Card,
    CardMedia,
    Chip,
    Container,
    Grow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { colors } from "../theme/colors";
import axios from "axios";

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
            transform: 'translateY(-40px)',
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
});

const GameTitle = styled(Typography)({
    transition: 'transform 0.3s ease-in-out',
    transform: 'translateY(0)',
});

const VersionChip = styled(Chip)({
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    border: `1px solid ${colors.border}`,
    color: colors.text,
    height: '24px',
    fontSize: '0.75rem',
    zIndex: 2,
    '& .MuiChip-label': {
        padding: '0 8px',
    },
});

const StyledButton = styled(Button)({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.text,
    borderRadius: '2px',
    padding: '6px 16px',
    minWidth: '140px',
    backdropFilter: 'blur(5px)',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease-in-out',
    opacity: 0,
    transform: 'translateY(20px)',
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: `1px solid ${colors.text}`,
    },
    '&.featured-button': {
        position: 'static',
        transform: 'none',
        opacity: 1,
        padding: '8px 24px',
        backgroundColor: colors.button,
        '&:hover': {
            backgroundColor: colors.buttonHover,
        },
    },
});

const ProgressIndicator = styled(Box)({
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 2,
});

const IndicatorDot = styled(Box)(({ active, progress }) => ({
    width: '40px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '2px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${progress}%`,
        backgroundColor: colors.text,
        transition: 'width 0.1s linear',
    },
}));

const FeaturedContent = styled(Box)(({ animate }) => ({
    opacity: animate ? 0 : 1,
    transform: animate ? 'translateY(20px)' : 'translateY(0)',
    transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
}));

const GameCardComponent = ({ game, size, onDownload, onPlay, installedGames }) => {
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [isInstalled, setIsInstalled] = useState(installedGames.includes(game.game_id));
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        const checkGameStatus = async () => {
            if (window.electronAPI) {
                const running = await window.electronAPI.isGameRunning(game.game_id);
                setIsRunning(running);
            }
        };

        const handleGameStarted = (startedGameId) => {
            if (startedGameId === game.game_id) {
                setIsRunning(true);
            }
        };

        const handleGameStopped = (stoppedGameId) => {
            if (stoppedGameId === game.game_id) {
                setIsRunning(false);
            }
        };

        checkGameStatus();

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
    }, [game.game_id]);

    useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (progressData.gameId === game.game_id) {
                setDownloadProgress(`${Math.round(progressData.percentage * 100)}%`);
            }
        };

        const handleDownloadComplete = ({ gameId }) => {
            if (gameId === game.game_id) {
                setDownloadProgress(null);
                setIsInstalled(true);
            }
        };

        const handleGameUninstalled = (uninstalledGameId) => {
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
    }, [game.game_id]);

    if (!game) return null;

    const handleButtonClick = () => {
        if (isRunning) {
            window.electronAPI.stopGame(game.game_id);
        } else if (isInstalled) {
            onPlay(game.game_id);
        } else {
            onDownload(game.game_id);
        }
    };

    return (
        <GameCard size={size}>
            {game.version && (
                <VersionChip label={`v${game.version}`} />
            )}
            <StyledCardMedia
                component="img"
                image={game.background_image_url || ""}
                alt={game.game_name}
            />
            <CardOverlay>
                <GameTitle
                    className="game-title"
                    variant="h6"
                    sx={{ 
                        color: colors.text,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        fontWeight: 600
                    }}
                >
                    {game.game_name}
                </GameTitle>
                <StyledButton
                    className="add-library-button"
                    size="small"
                    variant="contained"
                    onClick={handleButtonClick}
                >
                    {downloadProgress || (isRunning ? "Stop" : (isInstalled ? "Play" : "Download"))}
                </StyledButton>
            </CardOverlay>
        </GameCard>
    );
};

const StorePage = () => {
    const [games, setGames] = useState([]);
    const [installedGames, setInstalledGames] = useState([]);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Memoize the shuffled games to prevent re-randomization on re-renders
    const shuffledGames = useMemo(() => {
        if (games.length > 0) {
            return [...games].sort(() => Math.random() - 0.5);
        }
        return [];
    }, [games]);

    // Memoize the featured games to prevent re-randomization
    const memoizedFeaturedGames = useMemo(() => {
        return shuffledGames.slice(0, 3);
    }, [shuffledGames]);

    useEffect(() => {
        const loadGames = async () => {
            try {
                // 1. Load installed games FIRST (only in desktop environment)
                if (window.electronAPI) {
                    try {
                        const fetchedInstalledGames = await window.electronAPI.getInstalledGames();
                        setInstalledGames(fetchedInstalledGames);
                    } catch (err) {
                        console.error("Error fetching installed games:", err);
                        setInstalledGames([]);
                    }
                }

                // 2. Try live API first
                try {
                    const response = await axios.get("/get-all-games");
                    const freshGames = response.data;
                    setGames(freshGames);
                    
                    // Cache games locally only in desktop environment
                    if (window.electronAPI?.cacheGamesLocally) {
                        window.electronAPI.cacheGamesLocally(freshGames);
                    }
                } catch (error) {
                    console.error("❌ Error fetching games from API:", error);
                    
                    // 3. Fallback to cached games if API fails (only in desktop environment)
                    if (window.electronAPI?.getCachedGames) {
                        try {
                            const cachedGames = await window.electronAPI.getCachedGames();
                            if (cachedGames.length > 0) {
                                setGames(cachedGames);
                                window.electronAPI?.showCustomNotification("Offline Mode", "Showing cached games. Some features may be limited.");
                            }
                        } catch (cacheErr) {
                            console.error("Error loading cached games:", cacheErr);
                        }
                    }
                }
            } catch (err) {
                console.error("Error in loadGames:", err);
            }
        };

        loadGames();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setIsAnimating(true);
                    setTimeout(() => {
                        setFeaturedIndex(prevIndex => (prevIndex + 1) % memoizedFeaturedGames.length);
                        setProgress(0);
                        setIsAnimating(false);
                    }, 300);
                    return 100;
                }
                return prev + 0.5;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [memoizedFeaturedGames.length]);

    const handlePlayGame = async (gameId) => {
        try {
            await window.electronAPI.openGame(gameId);
        } catch (err) {
            console.error("Error opening game:", err);
        }
    };

    const handleDownloadGame = async (gameId) => {
        try {
            await window.electronAPI.downloadGame(gameId);
        } catch (err) {
            console.error("Error downloading game:", err);
        }
    };

    const specialOffers = shuffledGames.slice(3, 8);
    const newReleases = shuffledGames.slice(8);

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Featured Games Carousel */}
                <Box sx={{ position: 'relative', mb: 4 }}>
                    {memoizedFeaturedGames[featuredIndex] && (
                        <Grow in={!isAnimating} timeout={500}>
                            <FeaturedCard>
                                {memoizedFeaturedGames[featuredIndex].version && (
                                    <VersionChip
                                        label={`v${memoizedFeaturedGames[featuredIndex].version}`}
                                    />
                                )}
                                <StyledCardMedia
                                    component="img"
                                    image={memoizedFeaturedGames[featuredIndex].background_image_url || ""}
                                    alt={memoizedFeaturedGames[featuredIndex].game_name}
                                />
                                <CardOverlay className="card-overlay">
                                    <FeaturedContent animate={isAnimating}>
                                        <Typography variant="h3" sx={{ 
                                            color: colors.text, 
                                            mb: 1,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                            fontWeight: 600
                                        }}>
                                            {memoizedFeaturedGames[featuredIndex].game_name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                            color: colors.text, 
                                            mb: 2,
                                            maxWidth: '600px',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                        }}>
                                            {memoizedFeaturedGames[featuredIndex].description}
                                        </Typography>
                                        <StyledButton
                                            className="featured-button"
                                            variant="contained"
                                            onClick={() => installedGames.includes(memoizedFeaturedGames[featuredIndex].game_id) 
                                                ? handlePlayGame(memoizedFeaturedGames[featuredIndex].game_id)
                                                : handleDownloadGame(memoizedFeaturedGames[featuredIndex].game_id)}
                                        >
                                            {installedGames.includes(memoizedFeaturedGames[featuredIndex].game_id) ? "Play" : "Download"}
                                        </StyledButton>
                                    </FeaturedContent>
                                </CardOverlay>
                                <ProgressIndicator>
                                    {memoizedFeaturedGames.map((_, index) => (
                                        <IndicatorDot
                                            key={index}
                                            active={index === featuredIndex}
                                            progress={index === featuredIndex ? progress : 0}
                                            onClick={() => {
                                                if (index !== featuredIndex) {
                                                    setFeaturedIndex(index);
                                                    setProgress(0);
                                                }
                                            }}
                                        />
                                    ))}
                                </ProgressIndicator>
                            </FeaturedCard>
                        </Grow>
                    )}
                </Box>

                {/* Special Offers */}
                <Typography variant="h5" sx={{ 
                    color: colors.text, 
                    mb: 2,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
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
                                }
                            }}
                        >
                            {specialOffers.slice(1, 5).map((game, index) => (
                                game && (
                                    <Grid item xs={6} key={game.game_id}>
                                        <Grow in={true} timeout={700 + (index * 100)}>
                                            <Box>
                                                <GameCardComponent
                                                    game={game}
                                                    size="small"
                                                    onDownload={handleDownloadGame}
                                                    onPlay={handlePlayGame}
                                                    installedGames={installedGames}
                                                />
                                            </Box>
                                        </Grow>
                                    </Grid>
                                )
                            ))}
                        </Grid>
                    </Grid>
                </Grid>

                {/* New Releases */}
                <Typography variant="h5" sx={{ 
                    color: colors.text, 
                    mb: 2,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    New Releases
                </Typography>
                <Grid container spacing={2}>
                    {newReleases.map((game, index) => (
                        <Grid item xs={12} sm={6} md={3} key={game.game_id}>
                            <Grow in={true} timeout={800 + (index * 100)}>
                                <Box>
                                    <GameCardComponent
                                        game={game}
                                        onDownload={handleDownloadGame}
                                        onPlay={handlePlayGame}
                                        installedGames={installedGames}
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