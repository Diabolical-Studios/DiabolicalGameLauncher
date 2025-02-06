import React, { useEffect, useState } from "react";
import GameCard from "../GameCard";
import Grid from "../Grid";

const Games = ({ teams }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTeams, setCurrentTeams] = useState([]);

    // ✅ Update `currentTeams` state when `teams` change
    useEffect(() => {
        if (teams && teams.length > 0) {
            setCurrentTeams(teams);
        }
    }, [teams]);

    useEffect(() => {
        console.log("🔄 Checking teams state:", currentTeams);

        // ✅ Ensure teams is properly loaded before fetching games
        if (!currentTeams || currentTeams.length === 0) {
            console.log("⏳ Waiting for teams to load...");
            return;
        }

        const fetchGames = async () => {
            try {
                let allGames = [];

                for (const team of currentTeams) {
                    if (!team.team_name) continue; // Safety check

                    console.log(`🎯 Fetching games for team: ${team.team_name}`);

                    const response = await fetch(
                        `https://launcher.diabolical.studio/.netlify/functions/getUserGames?team_name=${encodeURIComponent(team.team_name)}`,
                        {
                            method: "GET",
                            headers: { "Content-Type": "application/json" },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch games for team ${team.team_name}.`);
                    }

                    const data = await response.json();
                    console.log(`✅ Games for ${team.team_name}:`, data);

                    allGames = [...allGames, ...data]; // Merge all games
                }

                setGames(allGames);
            } catch (err) {
                console.error("❌ Error fetching games:", err);
                setError("Failed to load games.");
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [currentTeams]); // ✅ Use the stateful `currentTeams` instead of JSON.stringify(teams)

    if (!teams || teams.length === 0) return <p>⏳ Waiting for teams to load...</p>;
    if (loading) return <p>Loading games...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h3>Your Games</h3>
            {games.length === 0 ? (
                <p>You did not create any Games.</p>
            ) : (
                <div id="game-cards-container">
                    {games.map((game, index) => (
                        <GameCard key={index} game={game} isInstalled={false} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Games;
