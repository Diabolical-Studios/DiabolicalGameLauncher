import React from "react";
import {Stack, TextField} from "@mui/material";
import GameButton from "./button/GameButton";
import {colors} from "../theme/colors";

const GameCard = ({
                      game, isInstalled, isEditing = false, setGameName, setGameDescription, style = {},
                  }) => {
    const [downloadProgress, setDownloadProgress] = React.useState(null);
    const [gameInstalled, setGameInstalled] = React.useState(isInstalled);
    const [localVersion, setLocalVersion] = React.useState(null);

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
                fetchLocalVersion();
            }
        };

        const handleGameUninstalled = (gameId) => {
            if (gameId === game.game_id) {
                setGameInstalled(false);
                setLocalVersion(null);
            }
        };

        const fetchLocalVersion = async () => {
            if (window.electronAPI) {
                try {
                    const version = await window.electronAPI.getCurrentGameVersion(game.game_id);
                    setLocalVersion(version || "Not Installed");
                } catch (error) {
                    console.error("Error fetching local game version:", error);
                    setLocalVersion("Not Installed");
                }
            }
        };

        if (window.api) {
            window.electronAPI.onDownloadProgress(handleDownloadProgress);
            window.electronAPI.onDownloadComplete(handleDownloadComplete);
            window.electronAPI.onGameUninstalled(handleGameUninstalled);
        } else {
            console.log("window.api is not available (running in the browser)");
        }

        fetchLocalVersion(); // Fetch version when component mounts

    }, [game.game_id]);

    const handleButtonClick = () => {
        if (window.api) {
            if (gameInstalled) {
                window.electronAPI.openGame(game.game_id);
            } else {
                window.electronAPI.downloadGame(game.game_id);
            }
        } else console.log("window.api is not available (running in the browser)");
    };

    return (<div
        className="game-banner items-stretch justify-end"
        style={{
            backgroundImage: `url('${game.background_image_url}')`, ...style,
        }}
        onContextMenu={(e) => {
            e.preventDefault();
            window.electronAPI.showContextMenu(game.game_id, {
                x: e.pageX, y: e.pageY,
            });
        }}
    >
        {/* Editable Fields if Editing Mode is Enabled */}
        <div className="game-details">
            {isEditing ? (<TextField
                variant={"standard"}
                fullWidth
                multiline
                minRows={1}
                maxRows={2}
                value={game.game_name}
                placeholder={"Game Name"}
                onChange={(e) => setGameName && setGameName(e.target.value)}
                sx={{
                    "& .MuiInputBase-root": {
                        border: "none",
                    }, "& .MuiInputBase-input": {
                        color: colors.text, fontSize: "18px", textTransform: "uppercase", fontWeight: 600,
                    },
                }}
            />) : (<h3>{game.game_name.toUpperCase()}</h3>)}

            {isEditing ? (<TextField
                variant={"standard"}
                fullWidth
                multiline
                placeholder={"Game Description lalalala"}
                minRows={1}
                maxRows={4}
                value={game.description}
                onChange={(e) => setGameDescription && setGameDescription(e.target.value)}
                sx={{
                    "& .MuiInputBase-root": {
                        border: "none",
                    }, "& .MuiInputBase-input": {
                        color: "#8e8e8e", fontSize: "14px", lineHeight: "normal",
                    },
                }}
            />) : (<p>{game.description}</p>)}

            {/* Display Latest Version */}
            <p style={{fontSize: "14px", color: colors.success}}>
                Latest Version: {game.version || "Not Installed"}
            </p>
        </div>

        {/* Controls */}
        <Stack className={"flex flex-row gap-3"}>
            <GameButton
                gameInstalled={gameInstalled}
                downloadProgress={downloadProgress}
                gameVersion={localVersion || "Not Installed"}
                onClick={handleButtonClick}
                gameId={game.game_id}
            />
        </Stack>
    </div>);
};

export default GameCard;
