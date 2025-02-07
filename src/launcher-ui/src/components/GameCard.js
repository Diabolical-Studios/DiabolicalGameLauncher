import React, { useEffect, useState } from "react";
import HoverMenu from "./button/HoverMenu";
import GameButton from "./button/GameButton";

const GameCard = ({ game, isInstalled }) => {
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [gameInstalled, setGameInstalled] = useState(isInstalled);

    useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (progressData.gameId === game.game_id) {
                setDownloadProgress(`${Math.round(progressData.percentage * 100)}%`);
            }
        };

        const handleDownloadComplete = ({ gameId }) => {
            if (gameId === game.game_id) {
                setGameInstalled(true);
                setDownloadProgress(null);
            }
        };

        window.electronAPI.onDownloadProgress(handleDownloadProgress);
        window.electronAPI.onDownloadComplete(handleDownloadComplete);
    }, [game.game_id]);

    const handleButtonClick = () => {
        if (gameInstalled) {
            window.electronAPI.openGame(game.game_id);
        } else {
            window.electronAPI.downloadGame(game.game_id);
        }
    };

    return (
        <div
            className="game-banner"
            style={{ backgroundImage: `url('${game.background_image_url}')` }}
            onContextMenu={(e) => {
                e.preventDefault();
                window.electronAPI.showContextMenu(game.game_id, { x: e.pageX, y: e.pageY });
            }}
        >
            <div className="game-details">
                <h3>{game.game_name.toUpperCase()}</h3>
                <p>{game.description}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
                <GameButton
                    gameInstalled={gameInstalled}
                    downloadProgress={downloadProgress}
                    gameVersion={game.version}
                    onClick={handleButtonClick}
                />

                <HoverMenu
                    actions={[
                        { label: "Uninstall", icon: "MenuIcons/Trash.png", onClick: () => console.log("Uninstall clicked") },
                    ]}
                />
            </div>
        </div>
    );
};

export default GameCard;
