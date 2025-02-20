import React from "react";
import {Stack, TextField} from "@mui/material";
import GameButton from "./button/GameButton";
import {colors} from "../theme/colors";

const GameCard = ({
                      game, isInstalled, isEditing = false, setGameName, setGameDescription, style = {}
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
            window.electronAPI.showContextMenu(game.game_id, {x: e.pageX, y: e.pageY});
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
                    }
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
                    }
                }}
            />) : (<p>{game.description}</p>)}
        </div>

        {/* Controls */}
        <Stack className={"flex flex-row gap-3"}>
            <GameButton
                gameInstalled={gameInstalled}
                downloadProgress={downloadProgress}
                gameVersion={game.version}
                onClick={handleButtonClick}
            />
        </Stack>
    </div>);
};

export default GameCard;
