import React from "react";
import {Stack, Typography, Box, Button} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CircleIcon from '@mui/icons-material/Circle';import {colors} from "../../theme/colors";

const GameInfoPanel = ({game}) => {
    const openRepoLink = () => {
        if (window.electronAPI && game.github_repo) {
            window.electronAPI.openExternal(`https://github.com/${game.github_repo}`);
        } else {
            window.open(`https://github.com/${game.github_repo}`, "_blank");
        }
    };

    const openRepoActions = () => {
        if (window.electronAPI && game.github_repo) {
            window.electronAPI.openExternal(`https://github.com/${game.github_repo}/actions`);
        } else {
            window.open(`https://github.com/${game.github_repo}`, "_blank");
        }
    };

    const gameDetails = {
        "Game Name": game.game_name,
        "Team": game.team_name,
        "Game ID": game.game_id,
        "Version": game.version,
        "Repository": game.github_repo ? (<Button
            onClick={openRepoLink}
            variant="outlined"
            startIcon={<OpenInNewIcon/>}
            sx={{
                color: colors.primary,
                borderColor: colors.primary,
                fontWeight: "bold",
                "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.1)"},
            }}
        >
            {game.github_repo}
        </Button>) : "No Repo Linked",
        "Deploy Status": game.game_name ? (<Button
            onClick={openRepoActions}
            variant="outlined"
            startIcon={<CircleIcon/>}
            sx={{
                color: colors.primary,
                borderColor: colors.primary,
                fontWeight: "bold",
                "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.1)"},
            }}
        >
            Deployed
        </Button>) : "No Repo Linked",
    };

    return (<Stack
        sx={{
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "12px",
            borderRadius: "2px",
            color: colors.text,
            border: `1px solid ${colors.border}`,
        }}
    >
        {Object.entries(gameDetails).map(([key, value]) => (<Box
            key={key}
            sx={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
        >
            <Typography variant="body2" sx={{color: colors.textSecondary}}>
                {key}:
            </Typography>
            <Typography variant="body2" sx={{fontWeight: "bold", color: colors.text}}>
                {value}
            </Typography>
        </Box>))}
    </Stack>);
};

export default GameInfoPanel;
