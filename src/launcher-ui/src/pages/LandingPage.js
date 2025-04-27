import React, {useEffect, useState} from "react";
import {Slide} from "@mui/material";
import GameCard from "../components/GameCard";
import GameCardsSkeleton from "../components/skeleton/GameCardsSkeleton";
import axios from "axios";

const LandingPage = () => {
    const [games, setGames] = useState([]);
    const [installedGames, setInstalledGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGames = async () => {
            // 1. Load installed games FIRST
            try {
                const fetchedInstalledGames = await window.electronAPI.getInstalledGames();
                setInstalledGames(fetchedInstalledGames);
            } catch (err) {
                console.error("Error fetching installed games:", err);
                setInstalledGames([]);
            }

            // 2. Show cached games early (but AFTER installed games are known)
            if (window.electronAPI?.getCachedGames) {
                const cachedGames = await window.electronAPI.getCachedGames();
                if (cachedGames.length > 0) {
                    setGames(cachedGames);
                    setLoading(false); // Let UI load fast but accurately
                }
            }

            // 3. Try live API
            try {
                const response = await axios.get("/get-all-games");
                setGames(response.data);
                if (window.electronAPI?.cacheGamesLocally) {
                    window.electronAPI.cacheGamesLocally(response.data);
                }
            } catch (error) {
                console.error("❌ Error fetching games:", error);
                window.electronAPI?.showCustomNotification("Error Fetching Games", "The database is down! Showing offline games.");
            } finally {
                setLoading(false);
            }
        };

        loadGames();
    }, []);

    const handleAction = (gameId) => {
        if (installedGames.includes(gameId)) {
            window.electronAPI?.openGame(gameId);
        } else {
            window.electronAPI?.downloadGame(gameId);
        }
    };

    return (<div style={{display: "flex", flexDirection: "column", width: "100%", overflow: "auto"}}>
        {loading && <GameCardsSkeleton topBar={false} columns={4}/>}

        {!loading && (<div id="game-cards-container">
            {games.map((game, index) => (
                <Slide key={game.game_id} direction="up" in={!loading} timeout={300 + index * 100}>
                    <div>
                        <GameCard
                            game={game}
                            isInstalled={installedGames.includes(game.game_id)}
                            onAction={handleAction}
                        />
                    </div>
                </Slide>))}
        </div>)}
    </div>);
};

export default LandingPage;
