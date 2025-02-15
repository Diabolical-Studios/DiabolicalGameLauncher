import React from "react";
import {Box, Container, Typography} from "@mui/material";
import {colors} from "../../theme/colors";

const handleGitHubLogin = () => {
    const CLIENT_ID = "Ov23ligdn0N1TMqWtNTV";
    const redirectUri = encodeURIComponent("/.netlify/functions/github-auth");

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;

    if (window.api) {
        window.electronAPI.openExternal(authUrl);

    } else window.open(authUrl);
};

const LoginScreen = () => {
    return (<Container className={"flex flex-col justify-center items-center text-center size-full"}
                       sx={{
                           color: colors.text,
                       }}
    >
        <Typography variant="h2" fontWeight={700} gutterBottom sx={{fontSize: {xs: "32px"}}}>
            Power Up Your Indie Games
        </Typography>
        <Typography variant="h5" sx={{maxWidth: "600px", opacity: 0.8, fontSize: {xs: "16px", md: "20px"}}}>
            A **customizable, indie-friendly** launcher for game developers.
            Host, update, and distribute your builds with a stunning UI.
        </Typography>

        <Box mt={4}>
            <button className="game-button shimmer-button flex flex-row justify-between items-center gap-3 w-fit"
                    onClick={handleGitHubLogin}>
                <img alt="GitHub" className={"aspect-square w-6"}
                     src="MenuIcons/github-mark-white.png"/>
                <p className={"m-0"}>Get Started with GitHub</p>
            </button>
        </Box>
    </Container>);
};

export default LoginScreen;
