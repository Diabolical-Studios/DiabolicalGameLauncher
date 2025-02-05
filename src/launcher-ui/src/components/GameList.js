import React, { useEffect, useState } from "react";
import GameCard from "./GameCard";

const GameList = () => {
    const [games, setGames] = useState([]);
    const [installedGames, setInstalledGames] = useState([]);

    useEffect(() => {
        // Fetch game data from Electron API
        window.api.loadGames().then(setGames).catch(console.error);

        // Fetch installed games
        window.electronAPI.getInstalledGames().then(setInstalledGames).catch(console.error);
    }, []);

    const handleAction = (gameId) => {
        if (installedGames.includes(gameId)) {
            window.electronAPI.openGame(gameId);
        } else {
            window.electronAPI.downloadGame(gameId);
        }
    };

    return (
        <div id="game-cards-container">
            {games.map((game) => (
                <GameCard
                    key={game.game_id}
                    game={game}
                    isInstalled={installedGames.includes(game.game_id)}
                    onAction={handleAction}
                />
            ))}
        </div>
    );
};

export default GameList;
