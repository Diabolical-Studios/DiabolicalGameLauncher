import React, {useEffect, useState} from "react";

const GameCard = ({ game, isInstalled, onAction }) => {
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
            window.electronAPI.openGame(game.game_id); // Ensure this opens the game
        } else {
            window.electronAPI.downloadGame(game.game_id); // Downloads the game if not installed
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
                <button
                    className="game-button shimmer-button"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                    onClick={handleButtonClick}
                >
                    <img src={gameInstalled ? "MenuIcons/play.png" : "MenuIcons/download.png"} alt={gameInstalled ? "Play" : "Download"} />
                    <p style={{ margin: "0", fontSize: "14px" }}>
                        {downloadProgress || game.version}
                    </p>
                </button>
                <button className="game-button shimmer-button" style={{ width: "min-content" }}>
                    <img src={"MenuIcons/Hamburger.png"} alt="Menu" />
                </button>
            </div>
        </div>
    );
};

export default GameCard;
