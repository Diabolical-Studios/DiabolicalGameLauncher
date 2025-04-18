import React, { useEffect, useState } from "react";
import {
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
    Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { colors } from "../theme/colors";
import "./../settings.css";

const StyledSettingsSection = styled(Stack)(({ theme }) => ({
    backgroundColor: colors.background,
    border: "1px solid" + colors.border,
    borderRadius: "4px",
    padding: "16px",
    gap: "16px",
}));

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        windowSize: "1280x720",
        theme: "dark",
        language: "en",
        autoUpdate: true,
        notifications: true,
        minimizeToTray: true,
        launchOnStartup: false,
        downloadPath: "",
        maxConcurrentDownloads: 3,
        cacheSize: "5GB",
    });

    useEffect(() => {
        if (window.api) {
            window.electronAPI.getSettings().then((savedSettings) => {
                setSettings(prev => ({ ...prev, ...savedSettings }));
            });
            // Get current window size
            window.electronAPI.getWindowSize().then(({ width, height }) => {
                setSettings(prev => ({
                    ...prev,
                    windowSize: `${width}x${height}`
                }));
            });
        }
    }, []);

    const handleSettingChange = (setting, value) => {
        const newSettings = { ...settings, [setting]: value };
        setSettings(newSettings);
        if (window.api) {
            window.electronAPI.updateSettings(newSettings);
        }
    };

    const handleResolutionChange = (event) => {
        const newResolution = event.target.value;
        handleSettingChange("windowSize", newResolution);
        const [width, height] = newResolution.split("x").map(Number);
        if (window.api) {
            window.electronAPI.setWindowSize(width, height);
        }
    };

    return (
        <Box sx={{ 
            height: 'calc(100vh - 48px)',
            overflowY: 'auto',
            padding: '16px',
            '&::-webkit-scrollbar': {
                width: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: colors.background,
            },
            '&::-webkit-scrollbar-thumb': {
                background: colors.border,
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: colors.button,
            }
        }}>
            <Stack spacing={2} sx={{ width: '100%', maxWidth: '100%' }}>
                {/* Display Settings */}
                <StyledSettingsSection>
                    <Typography variant="h6" sx={{ color: colors.text }}>Display Settings</Typography>
                    <Stack spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel id="resolution-label" sx={{ color: colors.text }}>Window Size</InputLabel>
                            <Select
                                labelId="resolution-label"
                                value={settings.windowSize}
                                onChange={handleResolutionChange}
                                label="Window Size"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.text,
                                        backgroundColor: colors.background,
                                        "& fieldset": {
                                            borderColor: colors.border,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="1280x720">1280x720</MenuItem>
                                <MenuItem value="1920x1080">1920x1080</MenuItem>
                                <MenuItem value="2560x1440">2560x1440</MenuItem>
                                <MenuItem value="3840x2160">3840x2160</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="theme-label" sx={{ color: colors.text }}>Theme</InputLabel>
                            <Select
                                labelId="theme-label"
                                value={settings.theme}
                                onChange={(e) => handleSettingChange("theme", e.target.value)}
                                label="Theme"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.text,
                                        backgroundColor: colors.background,
                                        "& fieldset": {
                                            borderColor: colors.border,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="dark">Dark</MenuItem>
                                <MenuItem value="light">Light</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </StyledSettingsSection>

                {/* Application Settings */}
                <StyledSettingsSection>
                    <Typography variant="h6" sx={{ color: colors.text }}>Application Settings</Typography>
                    <Stack spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.autoUpdate}
                                    onChange={(e) => handleSettingChange("autoUpdate", e.target.checked)}
                                    sx={{
                                        "& .MuiSwitch-thumb": {
                                            backgroundColor: colors.button,
                                        },
                                        "& .MuiSwitch-track": {
                                            backgroundColor: colors.border,
                                        },
                                    }}
                                />
                            }
                            label="Auto-update launcher"
                            sx={{ color: colors.text }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.notifications}
                                    onChange={(e) => handleSettingChange("notifications", e.target.checked)}
                                    sx={{
                                        "& .MuiSwitch-thumb": {
                                            backgroundColor: colors.button,
                                        },
                                        "& .MuiSwitch-track": {
                                            backgroundColor: colors.border,
                                        },
                                    }}
                                />
                            }
                            label="Enable notifications"
                            sx={{ color: colors.text }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.minimizeToTray}
                                    onChange={(e) => handleSettingChange("minimizeToTray", e.target.checked)}
                                    sx={{
                                        "& .MuiSwitch-thumb": {
                                            backgroundColor: colors.button,
                                        },
                                        "& .MuiSwitch-track": {
                                            backgroundColor: colors.border,
                                        },
                                    }}
                                />
                            }
                            label="Minimize to system tray"
                            sx={{ color: colors.text }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.launchOnStartup}
                                    onChange={(e) => handleSettingChange("launchOnStartup", e.target.checked)}
                                    sx={{
                                        "& .MuiSwitch-thumb": {
                                            backgroundColor: colors.button,
                                        },
                                        "& .MuiSwitch-track": {
                                            backgroundColor: colors.border,
                                        },
                                    }}
                                />
                            }
                            label="Launch on system startup"
                            sx={{ color: colors.text }}
                        />
                    </Stack>
                </StyledSettingsSection>

                {/* Download Settings */}
                <StyledSettingsSection>
                    <Typography variant="h6" sx={{ color: colors.text }}>Download Settings</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Download Path"
                            value={settings.downloadPath}
                            onChange={(e) => handleSettingChange("downloadPath", e.target.value)}
                            fullWidth
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: colors.text,
                                    backgroundColor: colors.background,
                                    "& fieldset": {
                                        borderColor: colors.border,
                                    },
                                },
                                "& .MuiInputLabel-root": {
                                    color: colors.text,
                                },
                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="max-downloads-label" sx={{ color: colors.text }}>Max Concurrent Downloads</InputLabel>
                            <Select
                                labelId="max-downloads-label"
                                value={settings.maxConcurrentDownloads}
                                onChange={(e) => handleSettingChange("maxConcurrentDownloads", e.target.value)}
                                label="Max Concurrent Downloads"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.text,
                                        backgroundColor: colors.background,
                                        "& fieldset": {
                                            borderColor: colors.border,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="cache-size-label" sx={{ color: colors.text }}>Cache Size Limit</InputLabel>
                            <Select
                                labelId="cache-size-label"
                                value={settings.cacheSize}
                                onChange={(e) => handleSettingChange("cacheSize", e.target.value)}
                                label="Cache Size Limit"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.text,
                                        backgroundColor: colors.background,
                                        "& fieldset": {
                                            borderColor: colors.border,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="1GB">1GB</MenuItem>
                                <MenuItem value="5GB">5GB</MenuItem>
                                <MenuItem value="10GB">10GB</MenuItem>
                                <MenuItem value="20GB">20GB</MenuItem>
                                <MenuItem value="50GB">50GB</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </StyledSettingsSection>
            </Stack>
        </Box>
    );
};

export default SettingsPage;
