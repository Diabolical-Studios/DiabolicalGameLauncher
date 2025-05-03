import React from "react";
import {Stack, Typography, TextField, Grid, IconButton, Tooltip, Divider as MuiDivider} from "@mui/material";
import {colors} from "../../theme/colors";
import LogoutButton from "./LogoutButton";
import LogoutIcon from "@mui/icons-material/Logout";

// Use local SVGs for each service, with a description for the tooltip
const services = [
    {
        name: 'Discord',
        icon: '/logos/discord.svg',
        description: 'Get Discord role integration and team chat features.'
    },
    {
        name: 'Steam',
        icon: '/logos/steam.svg',
        description: 'Deploy straight to Steam from GitHub.'
    },
    {
        name: 'Unity',
        icon: '/logos/unity.svg',
        description: 'Share your Unity asset packs with your team members.'
    },
    {
        name: 'Patreon',
        icon: '/logos/patreon.svg',
        description: 'Get perks such as more hosting space, higher limits on games/teams, etc.'
    },
];

const PATREON_CLIENT_ID = "1xNwOOd3hVInyijzxYT0qrqTf1mkuhYPqcZusknZ4I6MQhk-97vzlp2ABpqgMHFH";
const REDIRECT_URI = "https://launcher.diabolical.studio/.netlify/functions/patreonAuth";

const getPatreonOAuthUrl = () => {
    // Detect if running in Electron (customize this check as needed)
    const isElectron = window?.navigator?.userAgent?.toLowerCase().includes('electron');
    const state = isElectron ? 'electron' : 'web';
    return `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identity%20identity.memberships&state=${state}`;
};

const iconButtonStyle = {
    background: '#000',
    borderRadius: '4px',
    width: 48,
    height: 48,
    border: `1px solid ${colors.border}`,
    transition: 'background 0.2s, border-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 0,
    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)',
    '&:hover': {
        background: '#fff',
        borderColor: '#fff',
    },
};

const imgStyle = {
    width: 24,
    height: 24,
    filter: 'invert(100%)',
    transition: 'filter 0.2s',
};

const imgHoverStyle = {
    filter: 'invert(0%)',
};

const Divider = () => (
    <MuiDivider sx={{ borderColor: colors.border, opacity: 0.2, my: 2 }} />
);

const AccountSettings = ({username}) => {
    const [hovered, setHovered] = React.useState(null);

    const handlePatreonClick = () => {
        const url = getPatreonOAuthUrl();
        if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
            window.electronAPI.openExternal(url);
        } else {
            window.location.href = url;
        }
    };

    return (
        <Stack className="overflow-hidden" sx={{width: '100%', maxWidth: "100%", margin: 0}}>
            <Stack className="flex p-5 overflow-auto flex-col gap-5" sx={{background: 'rgba(255,255,255,0.01)', borderRadius: '2px', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)'}}>
                {/* Profile Info */}
                <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{color: colors.text, fontWeight: 600, letterSpacing: 0.2}}>
                        Profile
                    </Typography>
                    <Stack direction="row" style={{gap: "12px"}} alignItems="center">
                        <TextField
                            label="Username"
                            value={username}
                            disabled
                            fullWidth
                            sx={{
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.03)',
                                "& .MuiOutlinedInput-root": {
                                    color: colors.text,
                                    fontSize: "16px",
                                    borderRadius: '2px',
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    border: "1px solid" + colors.border + "!important",
                                    borderRadius: "4px",
                                },
                                "& .MuiFormLabel-root": {
                                    color: colors.text,
                                },
                            }}
                        />
                        <LogoutButton style={{height: "100%", margin: 0, borderRadius: '4px'}}>
                            <LogoutIcon sx={{ color: colors.error }} />
                        </LogoutButton>
                    </Stack>
                </Stack>

                <Divider/>

                {/* Add Accounts Section */}
                <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{color: colors.text, fontWeight: 600, letterSpacing: 0.2}}>
                        Add accounts to your profile
                    </Typography>
                    <Typography variant="body2" sx={{color: colors.text, opacity: 0.7, fontWeight: 400, fontSize: 14, mb: 1}}>
                        Connect your accounts to unlock features and personalize your experience. Only you can see your connected accounts unless you choose to display them.
                    </Typography>
                    <Grid container spacing={2} sx={{mt: 0}}>
                        {services.map((service) => (
                            <Grid item key={service.name}>
                                <Tooltip title={<span style={{fontSize: 13, lineHeight: 1.4}}>{service.description}</span>} placement="top" arrow>
                                    <IconButton
                                        sx={iconButtonStyle}
                                        onMouseEnter={() => setHovered(service.name)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => {
                                            if (service.name === 'Patreon') {
                                                handlePatreonClick();
                                            }
                                        }}
                                    >
                                        <img
                                            src={service.icon}
                                            alt={service.name}
                                            style={
                                                hovered === service.name
                                                    ? { ...imgStyle, ...imgHoverStyle }
                                                    : imgStyle
                                            }
                                        />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>

                <Divider/>

                {/* Connected Accounts Section (empty for now) */}
                <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{color: colors.text, fontWeight: 600, letterSpacing: 0.2}}>
                        Connected Accounts
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default AccountSettings;
