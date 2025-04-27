import React, {useEffect, useState} from "react";

const GameButton = ({gameInstalled, downloadProgress, gameVersion, onClick, gameId}) => {
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        const checkGameStatus = async () => {
            if (window.electronAPI) {
                const running = await window.electronAPI.isGameRunning(gameId);
                setIsRunning(running);
            }
        };

        checkGameStatus();

        const handleGameStarted = (startedGameId) => {
            if (startedGameId === gameId) {
                setIsRunning(true);
            }
        };

        const handleGameStopped = (stoppedGameId) => {
            if (stoppedGameId === gameId) {
                setIsRunning(false);
            }
        };

        if (window.electronAPI) {
            window.electronAPI.onGameStarted(handleGameStarted);
            window.electronAPI.onGameStopped(handleGameStopped);
        }

        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeGameStartedListener(handleGameStarted);
                window.electronAPI.removeGameStoppedListener(handleGameStopped);
            }
        };
    }, [gameId]);

    const handleClick = () => {
        if (isRunning) {
            window.electronAPI.stopGame(gameId);
        } else {
            onClick();
        }
    };

    return (
        <button
            className="game-button shimmer-button w-full flex justify-between align-center"
            onClick={handleClick}
        >
            <img
                src={isRunning ? "/stop.png" : (gameInstalled ? "/play.png" : "/download.png")}
                alt={isRunning ? "Stop" : (gameInstalled ? "Play" : "Download")}
            />
            <p style={{margin: "0", fontSize: "14px"}}>
                {downloadProgress || gameVersion}
            </p>
        </button>
    );
};

export default GameButton;
