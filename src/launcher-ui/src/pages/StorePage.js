import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Grid,
    Button,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Stack,
    LinearProgress,
    IconButton,
    Paper,
    Container,
    Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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

const ProgressWrapper = styled(Box)({
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '8px',
    backdropFilter: 'blur(5px)',
});

const CarouselButton = styled(IconButton)({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: colors.text,
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    if (!game) return null;
    const isInstalled = installedGames.includes(game.game_id);

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
                    onClick={() => isInstalled ? onPlay(game.game_id) : onDownload(game.game_id)}
                >
                    {isInstalled ? "Play" : "Download"}
                </StyledButton>
            </CardOverlay>
        </GameCard>
    );
};

const StorePage = () => {
    const [games, setGames] = useState([]);
    const [installedGames, setInstalledGames] = useState([]);
    const [activeDownloads, setActiveDownloads] = useState({});
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [featuredGames, setFeaturedGames] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(true);

    // Function to handle featured game change with animation
    const changeFeaturedGame = (newIndex) => {
        setIsAnimating(true);
        setTimeout(() => {
            setFeaturedIndex(newIndex);
            setTimeout(() => {
                setIsAnimating(false);
            }, 50);
        }, 300);
    };

    // Auto-switch featured game with progress
    useEffect(() => {
        if (!featuredGames || featuredGames.length === 0) return;
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    const nextIndex = (featuredIndex + 1) % featuredGames.length;
                    changeFeaturedGame(nextIndex);
                    return 0;
                }
                return prev + 1;
            });
        }, 50); // Update progress every 50ms for smooth animation

        return () => clearInterval(interval);
    }, [featuredGames, featuredIndex]);

    useEffect(() => {
        const loadGames = async () => {
            // 1. Load installed games FIRST
            try {
                const fetchedInstalledGames = await window.electronAPI.getInstalledGames();
                setInstalledGames(fetchedInstalledGames);
            } catch (err) {
                console.error("Error fetching installed games:", err);
                setInstalledGames([]);
            }

            // 2. Show cached games early (but AFTER installed games are known)
            if (window.electronAPI?.getCachedGames) {
                const cachedGames = await window.electronAPI.getCachedGames();
                if (cachedGames.length > 0) {
                    const shuffledGames = cachedGames;
                    setGames(shuffledGames);
                    setFeaturedGames(shuffledGames.slice(0, 3));
                    setLoading(false); // Let UI load fast but accurately
                }
            }

            // 3. Try live API
            try {
                const response = await axios.get("/get-all-games");
                const freshGames = response.data;
                setGames(freshGames);
                setFeaturedGames(freshGames.slice(0, 3));
                if (window.electronAPI?.cacheGamesLocally) {
                    window.electronAPI.cacheGamesLocally(freshGames);
                }
            } catch (error) {
                console.error("❌ Error fetching games:", error);
                window.electronAPI?.showCustomNotification("Error Fetching Games", "The database is down! Showing offline games.");
            } finally {
                setLoading(false);
            }
        };

        loadGames();
    }, []);

    useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (!progressData?.gameId) return;
            const percent = Math.round(progressData.percentage * 100);
            setActiveDownloads((prev) => ({
                ...prev,
                [progressData.gameId]: {
                    percent,
                    percentageString: `${percent}%`,
                },
            }));
        };

        const handleDownloadComplete = ({gameId}) => {
            setActiveDownloads((prev) => {
                const updated = {...prev};
                delete updated[gameId];
                return updated;
            });
            setInstalledGames(prev => [...prev, gameId]);
        };

        window.electronAPI?.onDownloadProgress(handleDownloadProgress);
        window.electronAPI?.onDownloadComplete(handleDownloadComplete);

        return () => {
            // Cleanup
        };
    }, []);

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

    const specialOffers = games.slice(3, 8); // Get 5 games for special offers
    const newReleases = games.slice(8);

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Featured Games Carousel */}
                <Box sx={{ position: 'relative', mb: 4 }}>
                    {featuredGames[featuredIndex] && (
                        <FeaturedCard>
                            {featuredGames[featuredIndex].version && (
                                <VersionChip
                                    label={`v${featuredGames[featuredIndex].version}`}
                                />
                            )}
                            <StyledCardMedia
                                component="img"
                                image={featuredGames[featuredIndex].background_image_url || ""}
                                alt={featuredGames[featuredIndex].game_name}
                            />
                            <CardOverlay className="card-overlay">
                                <FeaturedContent animate={isAnimating}>
                                    <Typography variant="h3" sx={{ 
                                        color: colors.text, 
                                        mb: 1,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                        fontWeight: 600
                                    }}>
                                        {featuredGames[featuredIndex].game_name}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: colors.text, 
                                        mb: 2,
                                        maxWidth: '600px',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                    }}>
                                        {featuredGames[featuredIndex].description}
                                    </Typography>
                                    <StyledButton
                                        className="featured-button"
                                        variant="contained"
                                        onClick={() => installedGames.includes(featuredGames[featuredIndex].game_id) 
                                            ? handlePlayGame(featuredGames[featuredIndex].game_id)
                                            : handleDownloadGame(featuredGames[featuredIndex].game_id)}
                                    >
                                        {installedGames.includes(featuredGames[featuredIndex].game_id) ? "Play" : "Download"}
                                    </StyledButton>
                                </FeaturedContent>
                            </CardOverlay>
                            <ProgressIndicator>
                                {featuredGames.map((_, index) => (
                                    <IndicatorDot
                                        key={index}
                                        active={index === featuredIndex}
                                        progress={index === featuredIndex ? progress : 0}
                                        onClick={() => {
                                            if (index !== featuredIndex) {
                                                changeFeaturedGame(index);
                                                setProgress(0);
                                            }
                                        }}
                                    />
                                ))}
                            </ProgressIndicator>
                        </FeaturedCard>
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
                            <GameCardComponent
                                game={specialOffers[0]}
                                size="large"
                                onDownload={handleDownloadGame}
                                onPlay={handlePlayGame}
                                installedGames={installedGames}
                            />
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
                            {specialOffers.slice(1, 5).map((game) => (
                                game && (
                                    <Grid item xs={6} key={game.game_id}>
                                        <GameCardComponent
                                            game={game}
                                            size="small"
                                            onDownload={handleDownloadGame}
                                            onPlay={handlePlayGame}
                                            installedGames={installedGames}
                                        />
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
                    {newReleases.map((game) => (
                        <Grid item xs={12} sm={6} md={3} key={game.game_id}>
                            <GameCardComponent
                                game={game}
                                onDownload={handleDownloadGame}
                                onPlay={handlePlayGame}
                                installedGames={installedGames}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default StorePage; 