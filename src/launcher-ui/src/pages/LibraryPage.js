import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    Grid,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    LinearProgress,
    Stack,
    Chip,
    IconButton,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import UpdateIcon from "@mui/icons-material/Update";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StorageIcon from '@mui/icons-material/Storage';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import StopIcon from '@mui/icons-material/Stop';
import { colors } from "../theme/colors";
import axios from "axios";

const LibraryPage = () => {
    const [installedGameIds, setInstalledGameIds] = useState([]);
    const [cachedGames, setCachedGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [activeDownloads, setActiveDownloads] = useState({});
    const [hasUpdate, setHasUpdate] = useState(false);
    const [applyingUpdate, setApplyingUpdate] = useState({});
    const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false);
    const [currentVersion, setCurrentVersion] = useState(null);
    const [latestVersion, setLatestVersion] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [playTime, setPlayTime] = useState('0 hours');
    const [achievements] = useState({ completed: 0, total: 0 });
    const [diskUsage, setDiskUsage] = useState('0 MB');
    const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);
    const [gameProperties, setGameProperties] = useState({
        branch: 'latest',
        language: 'en',
        downloadLocation: '',
        launchOptions: '',
        notes: ''
    });
    const [gameUpdates, setGameUpdates] = useState({});
    const [isGameRunning, setIsGameRunning] = useState(false);

    const fetchLocalVersion = useCallback(async (gameId) => {
        try {
            const current = await window.electronAPI.getCurrentGameVersion(gameId);
            // Get the latest version from the cached games instead of making another API call
            const gameInfo = cachedGames.find(g => g.game_id === gameId);
            const latest = gameInfo?.version;
            setCurrentVersion(current);
            setLatestVersion(latest);
            setHasUpdate(current !== latest);
        } catch (err) {
            console.error("Error fetching game versions:", err);
            setHasUpdate(false);
        }
    }, [cachedGames]);

    useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (!progressData?.gameId) return;

            const percent = Math.round(progressData.percentage * 100);
            setActiveDownloads((prev) => ({
                ...prev,
                [progressData.gameId]: {
                    percent,
                    percentageString: `${percent}%`,
                    time: Date.now(),
                },
            }));
        };

        const handleDownloadComplete = async ({ gameId }) => {
            console.log(`Download complete for game ${gameId}`);
            
            // First remove from active downloads
            setActiveDownloads((prev) => {
                const updated = { ...prev };
                delete updated[gameId];
                return updated;
            });

            // Set applying update state
            setApplyingUpdate(prev => ({ ...prev, [gameId]: true }));

            try {
                // Get the latest version from cached games
                const gameInfo = cachedGames.find(g => g.game_id === gameId);
                
                // Add a small delay to ensure file operations are complete
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    // Get the current version regardless of whether we found game info
                    const currentVersion = await window.electronAPI.getCurrentGameVersion(gameId);
                    
                    // Update UI if this is the selected game
                    if (gameId === selectedGame?.game_id) {
                        setCurrentVersion(currentVersion);
                        // Only set hasUpdate to false if we can verify versions match
                        if (gameInfo && currentVersion === gameInfo.version) {
                            setHasUpdate(false);
                        }
                        console.log(`UI updated for selected game ${gameId} with version ${currentVersion}`);
                    }

                    // Remove from gameUpdates if we can verify versions match
                    if (gameInfo && currentVersion === gameInfo.version) {
                        setGameUpdates(prev => {
                            const updated = { ...prev };
                            delete updated[gameId];
                            return updated;
                        });
                        console.log(`Game ${gameId} removed from updates list`);
                    }
                } catch (versionError) {
                    console.error(`Error getting version for ${gameId}:`, versionError);
                }
            } catch (error) {
                console.error(`Error in update process for ${gameId}:`, error);
            } finally {
                // Clear applying update state
                setApplyingUpdate(prev => {
                    const updated = { ...prev };
                    delete updated[gameId];
                    return updated;
                });
            }
        };

        window.electronAPI?.onDownloadProgress(handleDownloadProgress);
        window.electronAPI?.onDownloadComplete(handleDownloadComplete);

        return () => {
            window.electronAPI?.removeDownloadProgressListener(handleDownloadProgress);
        };
    }, [selectedGame, fetchLocalVersion, cachedGames]);

    useEffect(() => {
        const loadGames = async () => {
            try {
                // Get installed games
                const ids = await window.electronAPI.getInstalledGames();
                setInstalledGameIds(ids);

                // Load game metadata directly from the API
                const response = await axios.get("/get-all-games");
                const metadata = response.data;
                
                // Always update cached games with fresh API data
                setCachedGames(metadata);
                window.electronAPI.cacheGamesLocally(metadata);

                // Check for updates for all installed games
                const updates = {};
                for (const id of ids) {
                    try {
                        const current = await window.electronAPI.getCurrentGameVersion(id);
                        // Get the latest version from the API response
                        const gameInfo = metadata.find(g => g.game_id === id);
                        if (gameInfo && gameInfo.version !== current) {
                            updates[id] = { 
                                current, 
                                latest: gameInfo.version 
                            };
                        }
                    } catch (err) {
                        console.error(`Error checking updates for game ${id}:`, err);
                    }
                }
                setGameUpdates(updates);

                if (ids.length > 0) {
                    const first = metadata.find(g => g.game_id === ids[0]) || { game_id: ids[0] };
                    setSelectedGame(first);
                }
            } catch (err) {
                console.error("Error loading library:", err);
                // Only fallback to cached games if API fails
                try {
                    const cached = await window.electronAPI.getCachedGames();
                    setCachedGames(cached);
                } catch (cacheErr) {
                    console.error("Error loading cached games:", cacheErr);
                }
            }
        };

        loadGames();
        // Set up periodic update check
        const updateInterval = setInterval(loadGames, 300000); // Check every 5 minutes

        return () => clearInterval(updateInterval);
    }, []);

    useEffect(() => {
        if (selectedGame) {
            // Get the latest version from API data (cached games are always fresh from API)
            const gameInfo = cachedGames.find(g => g.game_id === selectedGame.game_id);
            if (gameInfo) {
                setLatestVersion(gameInfo.version);
            }

            // Fetch current version and game size
            const fetchGameInfo = async () => {
                if (window.electronAPI) {
                    try {
                        const [current, sizeInBytes, playtime] = await Promise.all([
                            window.electronAPI.getCurrentGameVersion(selectedGame.game_id),
                            window.electronAPI.getGameSize(selectedGame.game_id),
                            window.electronAPI.getGamePlaytime(selectedGame.game_id)
                        ]);
                        
                        setCurrentVersion(current);
                        // Compare with API version (from cachedGames which is fresh)
                        setHasUpdate(gameInfo && current !== gameInfo.version);

                        // Convert bytes to appropriate unit
                        let size;
                        if (sizeInBytes < 1024 * 1024) { // Less than 1 MB
                            size = `${(sizeInBytes / 1024).toFixed(2)} KB`;
                        } else if (sizeInBytes < 1024 * 1024 * 1024) { // Less than 1 GB
                            size = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
                        } else { // GB or larger
                            size = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
                        }
                        setDiskUsage(size);
                        setPlayTime(`${playtime} hours`);
                    } catch (err) {
                        console.error("Error fetching game info:", err);
                        setDiskUsage('Unknown');
                        setPlayTime('0 hours');
                    }
                }
            };
            fetchGameInfo();
        }
    }, [selectedGame, cachedGames]);

    useEffect(() => {
        const checkGameStatus = async () => {
            if (selectedGame && window.electronAPI) {
                const running = await window.electronAPI.isGameRunning(selectedGame.game_id);
                setIsGameRunning(running);
            }
        };

        const handleGameStarted = (startedGameId) => {
            if (selectedGame && startedGameId === selectedGame.game_id) {
                setIsGameRunning(true);
            }
        };

        const handleGameStopped = (stoppedGameId) => {
            if (selectedGame && stoppedGameId === selectedGame.game_id) {
                setIsGameRunning(false);
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
    }, [selectedGame]);

    const handleSelectGame = async (game) => {
        setSelectedGame(game);
        // Don't call fetchLocalVersion here, it will be called by the selectedGame effect
    };

    const handleContextMenu = (event, game) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            game,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleOpenInstallLocation = async (gameId) => {
        try {
            await window.electronAPI.openInstallLocation(gameId);
        } catch (err) {
            console.error("Error opening install location:", err);
        }
        handleCloseContextMenu();
    };

    const handleUninstallGame = async () => {
        try {
            await window.electronAPI.uninstallGame(selectedGame.game_id);
            setInstalledGameIds(prev => prev.filter(id => id !== selectedGame.game_id));
            setSelectedGame(null);
            setUninstallDialogOpen(false);
        } catch (err) {
            console.error("Error uninstalling game:", err);
        }
    };

    const handleOpenProperties = (game) => {
        setSelectedGame(game);
        // Load saved properties for this game
        const savedProperties = localStorage.getItem(`game_properties_${game.game_id}`);
        if (savedProperties) {
            setGameProperties(JSON.parse(savedProperties));
        }
        // Set the download location to just the game ID
        setGameProperties(prev => ({
            ...prev,
            downloadLocation: game.game_id
        }));
        setPropertiesDialogOpen(true);
        handleCloseContextMenu();
    };

    const handleSaveProperties = () => {
        if (selectedGame) {
            localStorage.setItem(`game_properties_${selectedGame.game_id}`, JSON.stringify(gameProperties));
            setPropertiesDialogOpen(false);
        }
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
                        <List>
                            {games.map((game) => {
                                const hasUpdate = gameUpdates[game.game_id];
                                const isDownloading = activeDownloads[game.game_id];
                                return (
                                    <ListItem
                                        key={game.game_id}
                                        selected={selectedGame?.game_id === game.game_id}
                                        onClick={() => handleSelectGame(game)}
                                        onContextMenu={(e) => handleContextMenu(e, game)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&.Mui-selected': {
                                                bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            },
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                                            },
                                            gap: "12px",
                                            position: 'relative',
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 0 }}>
                                            {game.team_icon_url ? (
                                                <Box
                                                    component="img"
                                                    src={game.team_icon_url}
                                                    alt=""
                                                    sx={{ width: 18 }}
                                                />
                                            ) : (
                                                <SportsEsportsIcon sx={{ color: colors.text }} />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ color: colors.text }}>
                                                        {game.game_name || game.game_id}
                                                    </Typography>
                                                    {hasUpdate && (
                                                        <Chip
                                                            label="Update"
                                                            size="small"
                                                            color="primary"
                                                            sx={{
                                                                height: '20px',
                                                                fontSize: '0.7rem',
                                                                bgcolor: colors.button,
                                                                color: colors.text,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: colors.text, opacity: 0.7 }}>
                                                    {isDownloading 
                                                        ? `Downloading: ${isDownloading.percentageString}`
                                                        : hasUpdate 
                                                            ? `v${hasUpdate.current} → v${hasUpdate.latest}`
                                                            : ''}
                                                </Typography>
                                            }
                                            sx={{ color: colors.text }}
                                        />
                                    </ListItem>
                                );
                            })}
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
                                height: 300,
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
                                    p: 3,
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                }}
                            >
                                <Typography variant="h4" sx={{ color: colors.text, mb: 1 }}>
                                    {selectedGame.game_name || selectedGame.game_id}
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip
                                        label={`Version ${currentVersion || "Not Installed"}`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: colors.text }}
                                    />
                                    {hasUpdate && (
                                        <Chip
                                            label={`Update to v${latestVersion}`}
                                            size="small"
                                            color="primary"
                                            sx={{ color: colors.text }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Paper>

                        {/* Game Info and Actions */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Stack spacing={2}>
                                        <Button
                                            variant="contained"
                                            startIcon={
                                                isDownloading ? <DownloadIcon /> : 
                                                applyingUpdate[selectedGame?.game_id] ? <UpdateIcon /> :
                                                hasUpdate ? <UpdateIcon /> : 
                                                isGameRunning ? <StopIcon /> : 
                                                <PlayArrowIcon />
                                            }
                                            disabled={isDownloading || applyingUpdate[selectedGame?.game_id]}
                                            onClick={() => {
                                                if (isDownloading || applyingUpdate[selectedGame?.game_id]) return;
                                                if (hasUpdate) {
                                                    window.electronAPI.downloadGame(selectedGame.game_id);
                                                } else if (isGameRunning) {
                                                    window.electronAPI.stopGame(selectedGame.game_id);
                                                } else {
                                                    window.electronAPI.openGame(selectedGame.game_id);
                                                }
                                            }}
                                            sx={{
                                                bgcolor: colors.primary,
                                                color: colors.text,
                                                '&:hover': {
                                                    bgcolor: colors.primaryHover,
                                                },
                                            }}
                                        >
                                            {isDownloading ? "Downloading" : 
                                             applyingUpdate[selectedGame?.game_id] ? "Applying Update..." :
                                             hasUpdate ? "Update" : 
                                             isGameRunning ? "Stop" : 
                                             "Play"}
                                        </Button>
                                        {isDownloading && (
                                            <LinearProgress
                                                variant="determinate"
                                                value={downloadingGame.percent}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: colors.button,
                                                    },
                                                }}
                                            />
                                        )}
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AccessTimeIcon sx={{ color: colors.text, opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ color: colors.text }}>
                                                {playTime}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <EmojiEventsIcon sx={{ color: colors.text, opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ color: colors.text }}>
                                                {achievements.completed}/{achievements.total} Achievements
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <StorageIcon sx={{ color: colors.text, opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ color: colors.text }}>
                                                {diskUsage}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                                        About
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: colors.text, opacity: 0.8 }}>
                                        {selectedGame.description || "No description available"}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: colors.text,
                            opacity: 0.5,
                        }}
                    >
                        <Typography variant="h6">Select a game to view details</Typography>
                    </Box>
                )}
            </Box>

            {/* Context Menu */}
            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => handleOpenProperties(contextMenu?.game)}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Properties
                </MenuItem>
                <MenuItem onClick={() => handleOpenInstallLocation(contextMenu?.game.game_id)}>
                    <ListItemIcon>
                        <FolderIcon fontSize="small" />
                    </ListItemIcon>
                    Open Install Location
                </MenuItem>
                <MenuItem onClick={() => {
                    window.electronAPI.downloadGame(contextMenu?.game.game_id);
                    handleCloseContextMenu();
                }}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    Download/Update
                </MenuItem>
                <MenuItem onClick={() => {
                    setSelectedGame(contextMenu?.game);
                    setUninstallDialogOpen(true);
                    handleCloseContextMenu();
                }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    Uninstall
                </MenuItem>
            </Menu>

            {/* Uninstall Dialog */}
            <Dialog
                open={uninstallDialogOpen}
                onClose={() => setUninstallDialogOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        border: `1px solid ${colors.border}`,
                    },
                }}
            >
                <DialogTitle sx={{ color: colors.text }}>
                    Uninstall {selectedGame?.game_name || selectedGame?.game_id}?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: colors.text }}>
                        Are you sure you want to uninstall this game? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUninstallDialogOpen(false)} sx={{ color: colors.text }}>
                        Cancel
                    </Button>
                    <Button onClick={handleUninstallGame} color="error">
                        Uninstall
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Properties Dialog */}
            <Dialog
                open={propertiesDialogOpen}
                onClose={() => setPropertiesDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        border: `1px solid ${colors.border}`,
                    },
                }}
            >
                <DialogTitle sx={{ color: colors.text }}>
                    {selectedGame?.game_name || selectedGame?.game_id} Properties
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: colors.text }}>Branch</InputLabel>
                            <Select
                                value={gameProperties.branch}
                                label="Branch"
                                onChange={(e) => setGameProperties(prev => ({ ...prev, branch: e.target.value }))}
                                sx={{
                                    color: colors.text,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.text,
                                    },
                                }}
                            >
                                <MenuItem value="latest">Latest</MenuItem>
                                <MenuItem value="dev">Development</MenuItem>
                                <MenuItem value="debug">Debug</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel sx={{ color: colors.text }}>Language</InputLabel>
                            <Select
                                value={gameProperties.language}
                                label="Language"
                                onChange={(e) => setGameProperties(prev => ({ ...prev, language: e.target.value }))}
                                sx={{
                                    color: colors.text,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.border,
                                    },
                                }}
                            >
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="es">Spanish</MenuItem>
                                <MenuItem value="fr">French</MenuItem>
                                <MenuItem value="de">German</MenuItem>
                                <MenuItem value="it">Italian</MenuItem>
                                <MenuItem value="pt">Portuguese</MenuItem>
                                <MenuItem value="ru">Russian</MenuItem>
                                <MenuItem value="ja">Japanese</MenuItem>
                                <MenuItem value="ko">Korean</MenuItem>
                                <MenuItem value="zh">Chinese</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Download Location"
                            value={gameProperties.downloadLocation}
                            onChange={(e) => setGameProperties(prev => ({ ...prev, downloadLocation: e.target.value }))}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <IconButton
                                        onClick={() => handleOpenInstallLocation(selectedGame?.game_id)}
                                        sx={{ color: colors.text }}
                                    >
                                        <FolderIcon />
                                    </IconButton>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.text,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text,
                                },
                            }}
                        />

                        <TextField
                            label="Launch Options"
                            value={gameProperties.launchOptions}
                            onChange={(e) => setGameProperties(prev => ({ ...prev, launchOptions: e.target.value }))}
                            fullWidth
                            placeholder="Additional command line arguments"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.text,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text,
                                },
                            }}
                        />

                        <TextField
                            label="Notes"
                            value={gameProperties.notes}
                            onChange={(e) => setGameProperties(prev => ({ ...prev, notes: e.target.value }))}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Add your notes about this game"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.text,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.text,
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPropertiesDialogOpen(false)} sx={{ color: colors.text }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveProperties}
                        startIcon={<SaveIcon />}
                        sx={{
                            bgcolor: colors.primary,
                            color: colors.text,
                            '&:hover': {
                                bgcolor: colors.primaryHover,
                            },
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LibraryPage;