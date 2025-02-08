import React, { useEffect, useState } from "react";
import GameCard from "./GameCard";
import GameCardsSkeleton from "./skeleton/GameCardsSkeleton"; // Import Skeleton Loader

const GameList = () => {
    const [games, setGames] = useState([]);
    const [installedGames, setInstalledGames] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const fetchedGames = await window.api.loadGames();
                setGames(fetchedGames);

                const fetchedInstalledGames = await window.electronAPI.getInstalledGames();
                setInstalledGames(fetchedInstalledGames);
            } catch (error) {
                console.error("Error fetching games:", error);
            } finally {
                setLoading(false); // Stop loading once data is fetched
            }
        };

        fetchGames();
    }, []);

    const handleAction = (gameId) => {
        if (installedGames.includes(gameId)) {
            window.electronAPI.openGame(gameId);
        } else {
            window.electronAPI.downloadGame(gameId);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {/* Show Skeleton Loader Outside the Grid */}
            {loading && <GameCardsSkeleton topBar={false} columns={4} />}

            {/* Game Cards Container (Only Rendered When Games Are Loaded) */}
            {!loading && (
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
            )}
        </div>
    );
};

export default GameList;
