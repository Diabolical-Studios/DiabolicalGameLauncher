import React, { useState, useEffect, useRef } from "react";
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
    Popper,
    Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { colors } from "../theme/colors";

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
    height: size === 'large' ? '300px' : size === 'small' ? '150px' : '200px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
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

const InfoPopper = styled(Popper)({
    zIndex: 1300,
    width: '380px',
    pointerEvents: 'none',
    '&[data-popper-placement*="right"] .MuiPaper-root': {
        marginLeft: '24px',
        transform: 'translateX(8px)',
    },
    '&[data-popper-placement*="left"] .MuiPaper-root': {
        marginRight: '24px',
        transform: 'translateX(-8px)',
    }
});

const PopperContent = styled(Paper)({
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border}`,
    borderRadius: '2px',
    color: colors.text,
    overflow: 'hidden',
});

const PopperHeader = styled(Box)({
    padding: '16px',
    borderBottom: `1px solid ${colors.border}`,
});

const PopperBody = styled(Box)({
    padding: '16px',
});

const ReviewSection = styled(Box)({
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    marginTop: '12px',
    borderRadius: '2px',
});

const TagChip = styled(Chip)({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.text,
    height: '22px',
    fontSize: '0.75rem',
    margin: '0 4px 4px 0',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});

const ScreenshotImage = styled('img')({
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '8px',
});

const GameInfoPopup = ({ game, anchorEl, open, placement }) => {
    return (
        <InfoPopper
            open={open}
            anchorEl={anchorEl}
            placement={placement}
            transition
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={200}>
                    <PopperContent>
                        <PopperHeader>
                            <Typography variant="h6" gutterBottom>
                                {game.game_name}
                            </Typography>
                            {game.release_date && (
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    Release Date: {game.release_date}
                                </Typography>
                            )}
                        </PopperHeader>
                        <PopperBody>
                            {/* Main Screenshot */}
                            {game.screenshots && game.screenshots[0] && (
                                <Box sx={{ mb: 2 }}>
                                    <ScreenshotImage
                                        src={game.screenshots[0]}
                                        alt={`${game.game_name} screenshot`}
                                    />
                                </Box>
                            )}

                            {/* Description */}
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                                {game.description}
                            </Typography>

                            {/* Reviews Section */}
                            <ReviewSection>
                                <Typography variant="subtitle2" gutterBottom sx={{ color: '#66c0f4' }}>
                                    Overall User Reviews:
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {game.reviews_count ? `${game.reviews_count} user reviews` : 'No reviews yet'}
                                </Typography>
                            </ReviewSection>

                            {/* Tags */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.7 }}>
                                    Popular user-defined tags for this product:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {game.categories?.map(category => (
                                        <TagChip
                                            key={category}
                                            label={category}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* Game Details */}
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {game.developer && (
                                    <Typography variant="body2">
                                        <span style={{ opacity: 0.7 }}>Developer: </span>
                                        <span style={{ color: '#66c0f4' }}>{game.developer}</span>
                                    </Typography>
                                )}
                                {game.publisher && (
                                    <Typography variant="body2">
                                        <span style={{ opacity: 0.7 }}>Publisher: </span>
                                        <span style={{ color: '#66c0f4' }}>{game.publisher}</span>
                                    </Typography>
                                )}
                            </Stack>
                        </PopperBody>
                    </PopperContent>
                </Fade>
            )}
        </InfoPopper>
    );
};

const GameCardComponent = ({ game, size, onDownload }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [showPopper, setShowPopper] = useState(false);
    const [popperPlacement, setPopperPlacement] = useState('right-start');
    const cardRef = useRef(null);

    const handleCardMouseEnter = (event) => {
        const card = cardRef.current;
        if (card) {
            const rect = card.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            // Check if there's enough space on the right (380px for popup width + 32px for margin)
            const hasSpaceOnRight = rect.right + 412 <= windowWidth;
            setPopperPlacement(hasSpaceOnRight ? 'right-start' : 'left-start');
        }
        setAnchorEl(event.currentTarget);
        setShowPopper(true);
    };

    const handleCardMouseLeave = () => {
        setShowPopper(false);
    };

    return (
        <Box
            ref={cardRef}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
        >
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
                        onClick={() => onDownload(game.game_id)}
                    >
                        Add to Library
                    </StyledButton>
                </CardOverlay>
            </GameCard>
            <GameInfoPopup
                game={game}
                anchorEl={anchorEl}
                open={showPopper}
                placement={popperPlacement}
            />
        </Box>
    );
};

const StorePage = () => {
    const [games, setGames] = useState([]);
    const [installedGames, setInstalledGames] = useState([]);
    const [activeDownloads, setActiveDownloads] = useState({});
    const [featuredIndex, setFeaturedIndex] = useState(0);

    useEffect(() => {
        const loadGames = async () => {
            try {
                const [cachedGames, installedIds] = await Promise.all([
                    window.electronAPI.getCachedGames(),
                    window.electronAPI.getInstalledGames()
                ]);
                setGames(cachedGames);
                setInstalledGames(installedIds);
            } catch (err) {
                console.error("Error loading games:", err);
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

    const featuredGames = games.slice(0, 3);
    const specialOffers = games.slice(3, 7);
    const newReleases = games.slice(7);

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Featured Games Carousel */}
                <Box sx={{ position: 'relative', mb: 4 }}>
                    {featuredGames.length > 0 && (
                        <FeaturedCard>
                            {featuredGames[featuredIndex]?.version && (
                                <VersionChip
                                    label={`v${featuredGames[featuredIndex].version}`}
                                />
                            )}
                            <StyledCardMedia
                                component="img"
                                image={featuredGames[featuredIndex]?.background_image_url || ""}
                                alt={featuredGames[featuredIndex]?.game_name}
                            />
                            <CardOverlay className="card-overlay">
                                <Typography variant="h3" sx={{ 
                                    color: colors.text, 
                                    mb: 1,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    fontWeight: 600
                                }}>
                                    {featuredGames[featuredIndex]?.game_name}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: colors.text, 
                                    mb: 2,
                                    maxWidth: '600px',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                }}>
                                    {featuredGames[featuredIndex]?.description}
                                </Typography>
                                <StyledButton
                                    className="featured-button"
                                    variant="contained"
                                    onClick={() => handleDownloadGame(featuredGames[featuredIndex]?.game_id)}
                                >
                                    Add to Library
                                </StyledButton>
                            </CardOverlay>
                            <CarouselButton
                                sx={{ left: 16 }}
                                onClick={() => setFeaturedIndex(prev => 
                                    prev === 0 ? featuredGames.length - 1 : prev - 1
                                )}
                            >
                                <ChevronLeftIcon />
                            </CarouselButton>
                            <CarouselButton
                                sx={{ right: 16 }}
                                onClick={() => setFeaturedIndex(prev => 
                                    prev === featuredGames.length - 1 ? 0 : prev + 1
                                )}
                            >
                                <ChevronRightIcon />
                            </CarouselButton>
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
                    {specialOffers.map((game, index) => (
                        <Grid item xs={12} sm={index === 0 ? 12 : 6} md={index === 0 ? 6 : 3} key={game.game_id}>
                            <GameCardComponent
                                game={game}
                                size={index === 0 ? 'large' : 'normal'}
                                onDownload={handleDownloadGame}
                            />
                        </Grid>
                    ))}
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
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default StorePage; 