import React, {useEffect, useState} from "react";
import {Slide} from "@mui/material";
import GameCard from "../components/GameCard";
import GameCardsSkeleton from "../components/skeleton/GameCardsSkeleton";

const LandingPage = () => {
    const [games, setGames] = useState([]);
    const [installedGames, setInstalledGames] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
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

        <div style={{display: "flex", flexDirection: "column", width: "100%", overflow: "auto"}}>
            {/* Show Skeleton Loader While Loading */}
            {loading && <GameCardsSkeleton topBar={false} columns={4}/>}

            {/* Game Cards Container */}
            {!loading && (
                <div id="game-cards-container">
                    {games.map((game, index) => (
                        <Slide
                            key={game.game_id}
                            direction="up"
                            in={!loading}
                            timeout={300 + index * 100}
                        >
                            <div>
                                <GameCard
                                    game={game}
                                    isInstalled={installedGames.includes(game.game_id)}
                                    onAction={handleAction}
                                />
                            </div>
                        </Slide>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LandingPage;
