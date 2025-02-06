import React, { useEffect, useState } from "react";

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeams = async () => {
            const sessionID = localStorage.getItem("sessionID");

            if (!sessionID) {
                console.error("❌ No session ID found in localStorage.");
                setError("No session ID found.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/getUserTeams", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "sessionID": sessionID,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch teams.");
                }

                const data = await response.json();
                console.log("✅ Fetched Teams Data:", data);

                setTeams(data); // Ensure correct format
            } catch (err) {
                console.error("❌ Error fetching teams:", err);
                setError("Failed to load teams.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) return <p>Loading teams...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "12px",
            width: "-webkit-fill-available",
            height: "fit-content",
        }}>
            <h3>Your Teams</h3>
            {teams.length === 0 ? (
                <p>You are not in any teams.</p>
            ) : (
                <ul style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "left",
                    
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgb(48, 48, 48)",
                    
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {teams.map((team, index) => (
                        <li key={index} style={{
                            padding: "12px",
                            gap: "12px",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}>
                            <span>{team.team_name}</span>
                            <button className={"game-button shimmer-button"}
                                style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "2px",
                                    cursor: "pointer",
                                    width: "fit-content",
                                }}
                                onClick={() => console.log("Clicked on team:", team.team_name)}
                            >
                                View
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Teams;
