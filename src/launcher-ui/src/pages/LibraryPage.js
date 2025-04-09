import React, {useEffect, useState} from "react";
import "../settings.css";
import ImageButton from "../components/button/ImageButton";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    LinearProgress,
    Grid,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import UpdateIcon from "@mui/icons-material/Update";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import DeleteIcon from "@mui/icons-material/Delete";
import {colors} from "../theme/colors";

const LibraryPage = () => {
    const [installedGameIds, setInstalledGameIds] = useState([]);
    const [cachedGames, setCachedGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [activeDownloads, setActiveDownloads] = useState({}); // { [gameId]: { percentage, speed } }
    const [downloadingGameId, setDownloadingGameId] = useState(null); // Track which game is actively downloading
    const [hasUpdate, setHasUpdate] = useState(false);
    const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false);

    // Set up download listeners
    useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (!progressData?.gameId) return; 

            const percent = Math.round(progressData.percentage * 100);
            setDownloadingGameId(progressData.gameId);

            setActiveDownloads((prev) => {
                const now = Date.now();
                const prevEntry = prev[progressData.gameId] || {};
                const timeDiff = prevEntry.time ? (now - prevEntry.time) / 1000 : null;
                const progressDiff = prevEntry.percent !== undefined ? percent - prevEntry.percent : null;

                let speed = prevEntry.speed || null;

                if (timeDiff && progressDiff > 0) {
                    const totalSizeMB = 500; // placeholder
                    speed = ((totalSizeMB * (progressDiff / 100)) / timeDiff).toFixed(2);
                }

                return {
                    ...prev, [progressData.gameId]: {
                        percent, percentageString: `${percent}%`, speed, time: now,
                    },
                };
            });
        };

        const handleDownloadComplete = ({gameId}) => {
            // ✅ Remove from activeDownloads
            setActiveDownloads((prev) => {
                const updated = {...prev};
                delete updated[gameId];
                return updated;
            });

            // ✅ Clear downloadingGameId if the completed one matches
            setDownloadingGameId((prev) => (prev === gameId ? null : prev));

            // ✅ Refresh state if it's the currently selected game
            if (gameId === selectedGame?.game_id) {
                setHasUpdate(false);
                fetchLocalVersion(gameId);
            }
        };

        const handleGameUninstalled = (gameId) => {
            if (gameId === selectedGame?.game_id) {
                setHasUpdate(false);
            }
        };

        window.electronAPI?.onDownloadProgress(handleDownloadProgress);
        window.electronAPI?.onDownloadComplete(handleDownloadComplete);
        window.electronAPI?.onGameUninstalled(handleGameUninstalled);

        return () => {
            // No remove methods currently, but safe cleanup placeholder
        };
    }, [selectedGame]);

    useEffect(() => {
        const loadGames = async () => {
            try {
                const ids = await window.electronAPI.getInstalledGames();
                setInstalledGameIds(ids);

                const metadata = await window.electronAPI.getCachedGames();
                setCachedGames(metadata);

                if (ids.length > 0) {
                    const first = metadata.find(g => g.game_id === ids[0]) || {game_id: ids[0]};
                    setSelectedGame(first);
                    fetchLocalVersion(first.game_id);
                }
            } catch (err) {
                console.error("Error loading library:", err);
            }
        };

        loadGames();
    }, []);

    const fetchLocalVersion = async (gameId) => {
        try {
            const currentVersion = await window.electronAPI.getCurrentGameVersion(gameId);
            const {latestVersion} = await window.electronAPI.getLatestGameVersion(gameId);
            setHasUpdate(currentVersion !== latestVersion);
        } catch (err) {
            console.error("Error fetching local game version:", err);
            setHasUpdate(false);
        }
    };

    const handleSelectGame = async (game) => {
        setSelectedGame(game);
        fetchLocalVersion(game.game_id);
    };

    const installedGameObjects = installedGameIds.map((id) => 
        cachedGames.find((g) => g.game_id === id) || { game_id: id, game_name: id }
    );

    const groupedGames = {
        Favorites: installedGameObjects.filter(g => g.favorite),
        Uncategorized: installedGameObjects.filter(g => !g.favorite),
    };

    const downloadingGame = activeDownloads[selectedGame?.game_id];
    const isDownloading = !!downloadingGame;
    const buttonLabel = isDownloading ? `Downloading ${downloadingGame.percentageString}` : hasUpdate ? "Update Available" : "Play";
    const buttonIcon = isDownloading ? <DownloadIcon /> : hasUpdate ? <UpdateIcon /> : <PlayArrowIcon />;

    const handleUninstallGame = async () => {
        try {
            // Call the uninstall function
            await window.electronAPI.uninstallGame(selectedGame.game_id);
            
            // Update installed games list
            setInstalledGameIds(prev => prev.filter(id => id !== selectedGame.game_id));
            
            // If the uninstalled game is currently selected, clear the selection
            if (selectedGame?.game_id === selectedGame?.game_id) {
                setSelectedGame(null);
            }
            
            // Close the dialog
            setUninstallDialogOpen(false);
            
            // Remove from active downloads if it's downloading
            setActiveDownloads(prev => {
                const newDownloads = { ...prev };
                delete newDownloads[selectedGame.game_id];
                return newDownloads;
            });
            
            // Clear downloading state if it's the current game
            if (downloadingGameId === selectedGame.game_id) {
                setDownloadingGameId(null);
            }
            
            // Reset update status
            setHasUpdate(false);
        } catch (error) {
            console.error('Error uninstalling game:', error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <Box sx={{ display: "flex", height: "100%", overflow: "hidden", gap: 2, p: 2 }}>
            {/* Left Panel - Game List */}
            <Paper 
                elevation={0}
                sx={{ 
                    width: 280,
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${colors.border}`,
                    overflow: 'auto',
                }}
            >
                {Object.entries(groupedGames).map(([groupName, games]) => (
                    <Box key={groupName}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: colors.text,
                                px: 2,
                                py: 1,
                                opacity: 0.7,
                            }}
                        >
                            {groupName} ({games.length})
                        </Typography>
                        <List disablePadding>
                            {games.map((game) => (
                                <ListItem
                                    key={game.game_id}
                                    selected={selectedGame?.game_id === game.game_id}
                                    onClick={() => handleSelectGame(game)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                        },
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.04)',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {game.team_icon_url ? (
                                            <Box
                                                component="img"
                                                src={game.team_icon_url}
                                                alt=""
                                                sx={{ width: 24, height: 24 }}
                                            />
                                        ) : (
                                            <SportsEsportsIcon sx={{ color: colors.text }} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={game.game_name || game.game_id}
                                        sx={{ color: colors.text }}
                                    />
                                    {activeDownloads[game.game_id] && (
                                        <Typography variant="caption" sx={{ color: colors.text }}>
                                            {activeDownloads[game.game_id].percentageString}
                                        </Typography>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ borderColor: colors.border }} />
                    </Box>
                ))}
            </Paper>

            {/* Right Panel - Game Details */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {selectedGame ? (
                    <>
                        {/* Game Banner */}
                        <Paper
                            elevation={0}
                            sx={{
                                height: 200,
                                bgcolor: 'rgba(0, 0, 0, 0.2)',
                                border: `1px solid ${colors.border}`,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                component="img"
                                src={selectedGame.background_image_url || ""}
                                alt=""
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: 0.4,
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    p: 2,
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                }}
                            >
                                <Typography variant="h5" sx={{ color: colors.text }}>
                                    {selectedGame.game_name || selectedGame.game_id}
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.text, opacity: 0.7 }}>
                                    Version {selectedGame.version || "1.0.0"}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Action Buttons */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: 'rgba(0, 0, 0, 0.2)',
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        startIcon={buttonIcon}
                                        disabled={isDownloading}
                                        onClick={() => {
                                            if (isDownloading) return;
                                            if (hasUpdate) {
                                                window.electronAPI.downloadGame(selectedGame.game_id);
                                            } else {
                                                window.electronAPI.openGame(selectedGame.game_id);
                                            }
                                        }}
                                        sx={{
                                            bgcolor: colors.button,
                                            color: colors.text,
                                            '&:hover': {
                                                bgcolor: colors.buttonHover,
                                            },
                                        }}
                                    >
                                        {buttonLabel}
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => setUninstallDialogOpen(true)}
                                        sx={{
                                            color: colors.text,
                                            borderColor: colors.border,
                                            '&:hover': {
                                                borderColor: colors.text,
                                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        Uninstall
                                    </Button>
                                </Grid>
                                {isDownloading && (
                                    <Grid item xs>
                                        <Box sx={{ width: '100%' }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={downloadingGame.percent}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: colors.button
                                                    }
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: colors.text, mt: 0.5 }}>
                                                {downloadingGame.speed ? `${downloadingGame.speed} MB/s` : 'Calculating...'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>

                        {/* Game Stats */}
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ color: colors.text, opacity: 0.7 }}>
                                        Last Played
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: colors.text }}>
                                        Today
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ color: colors.text, opacity: 0.7 }}>
                                        Play Time
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: colors.text }}>
                                        10.9 hours
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ color: colors.text, opacity: 0.7 }}>
                                        Achievements
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: colors.text }}>
                                        4/12
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="h6" sx={{ color: colors.text, opacity: 0.5 }}>
                            Select a game to view details
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Uninstall Confirmation Dialog */}
            <Dialog
                open={uninstallDialogOpen}
                onClose={() => setUninstallDialogOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        border: `1px solid ${colors.border}`,
                        backdropFilter: 'blur(10px)',
                    }
                }}
            >
                <DialogTitle sx={{ color: colors.text }}>
                    Uninstall Game
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: colors.text }}>
                        Are you sure you want to uninstall {selectedGame?.game_name || selectedGame?.game_id}?
                        This will remove all game files from your computer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setUninstallDialogOpen(false)}
                        sx={{ color: colors.text }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUninstallGame}
                        startIcon={<DeleteIcon />}
                        sx={{
                            color: 'red',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            },
                        }}
                    >
                        Uninstall
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LibraryPage;