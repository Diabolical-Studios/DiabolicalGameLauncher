import React from "react";
import {TextField, Stack} from "@mui/material";
import HoverMenu from "./button/HoverMenu";
import GameButton from "./button/GameButton";

const GameCard = ({
                      game, isInstalled, isEditing = false, setGameName, setGameIconUrl, setGameDescription, style = {}
                  }) => {
    const [downloadProgress, setDownloadProgress] = React.useState(null);
    const [gameInstalled, setGameInstalled] = React.useState(isInstalled);

    React.useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (progressData.gameId === game.game_id) {
                setDownloadProgress(`${Math.round(progressData.percentage * 100)}%`);
            }
        };

        const handleDownloadComplete = ({gameId, installPath}) => {
            if (gameId === game.game_id) {
                setGameInstalled(true);
                setDownloadProgress(null);
            }
        };

        const handleGameUninstalled = (gameId) => {
            if (gameId === game.game_id) {
                setGameInstalled(false);
            }
        };

        if (window.api) {
            window.electronAPI.onDownloadProgress(handleDownloadProgress);
            window.electronAPI.onDownloadComplete(handleDownloadComplete);
            window.electronAPI.onGameUninstalled(handleGameUninstalled);
        } else {
            console.log("window.api is not available (running in the browser)");
        }

    }, [game.game_id]);


    const handleButtonClick = () => {
        if (gameInstalled) {
            window.electronAPI.openGame(game.game_id);
        } else {
            window.electronAPI.downloadGame(game.game_id);
        }
    };

    return (<div
        className="game-banner"
        style={{
            backgroundImage: `url('${game.background_image_url}')`, ...style,
        }}
        onContextMenu={(e) => {
            e.preventDefault();
            window.electronAPI.showContextMenu(game.game_id, {x: e.pageX, y: e.pageY});
        }}
    >
        {/* Editable Fields if Editing Mode is Enabled */}
        <div className="game-details">
            {isEditing ? (<TextField
                variant={"standard"}
                fullWidth
                value={game.game_name}
                onChange={(e) => setGameName && setGameName(e.target.value)}
                sx={{
                    "& .MuiInputBase-root": {
                        border: "none",
                    }, "& .MuiInputBase-input": {
                        color: "#fff",
                        fontFamily: "'Consolas', sans-serif",
                        fontSize: "18px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                    }
                }}
            />) : (<h3>{game.game_name.toUpperCase()}</h3>)}

            {isEditing ? (<TextField
                variant={"standard"}
                fullWidth
                multiline
                minRows={2}
                value={game.description}
                onChange={(e) => setGameDescription && setGameDescription(e.target.value)}
                sx={{
                    "& .MuiInputBase-root": {
                        border: "none",
                    }, "& .MuiInputBase-input": {
                        color: "#8e8e8e", fontFamily: "'Consolas', sans-serif", fontSize: "14px", lineHeight: "normal",
                    }
                }}
            />) : (<p>{game.description}</p>)}
        </div>

        {/* Controls */}
        <Stack style={{display: "flex", flexDirection: "row", gap: "12px"}}>
            <GameButton
                gameInstalled={gameInstalled}
                downloadProgress={downloadProgress}
                gameVersion={game.version}
                onClick={handleButtonClick}
            />

            <HoverMenu
                actions={[{
                    label: "Uninstall", icon: "MenuIcons/Trash.png", onClick: () => console.log("Uninstall clicked")
                }]}
            />
        </Stack>
    </div>);
};

export default GameCard;
