import React, { useEffect, useState } from "react";
import GameCard from "../GameCard";
import Grid from "../Grid";

const Games = ({ teams }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGames = async () => {
            const sessionID = localStorage.getItem("sessionID");

            if (!sessionID) {
                console.error("❌ No session ID found in localStorage.");
                setError("No session ID found.");
                setLoading(false);
                return;
            }

            try {
                let allGames = [];

                // Fetch games for each team the user is part of
                for (const team of teams) {
                    const response = await fetch(
                        `https://launcher.diabolical.studio/.netlify/functions/getUserGames?team_name=${encodeURIComponent(team.team_name)}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "sessionID": sessionID,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch games for team ${team.team_name}.`);
                    }

                    const data = await response.json();
                    console.log(`✅ Fetched Games for ${team.team_name}:`, data);

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
    }, [teams]);

    if (loading) return <p>Loading games...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h3>Your Games</h3>
            {games.length === 0 ? (
                <p>You did not create any Games.</p>
            ) : (
                <Grid>
                    {games.map((game, index) => (
                        <GameCard key={index} game={game} isInstalled={false} />
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default Games;
