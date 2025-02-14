import React from "react";
import {Box, Container, Typography} from "@mui/material";
import {colors} from "../../theme/colors";

const handleGitHubLogin = () => {
    const CLIENT_ID = "Ov23ligdn0N1TMqWtNTV";
    const redirectUri = encodeURIComponent("https://launcher.diabolical.studio/.netlify/functions/github-auth");

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;

    if(window.api){
        window.electronAPI.openExternal(authUrl);

    } else window.open(authUrl);
};

const LoginScreen = () => {
    return (
        <Container
            maxWidth="lg"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                height: "-webkit-fill-available",
                width: "-webkit-fill-available",
                maxWidth: "none !important",
                color: colors.text,
                padding: "48px",
                borderRadius: "12px",
                boxShadow: "0 0 24px rgba(255, 255, 255, 0.1)",
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
                <button className="game-button shimmer-button" onClick={handleGitHubLogin}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            width: "fit-content",
                        }}>
                    <img alt="GitHub" style={{aspectRatio: "1/1", width: "16px"}}
                         src="MenuIcons/github-mark-white.png"/>
                    <p style={{margin: "0px", fontSize: "14px"}}>Get Started with GitHub</p>
                </button>
            </Box>
        </Container>
    );
};

export default LoginScreen;
