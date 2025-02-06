import React, { useEffect, useState } from "react";

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeams = async () => {
            const sessionID = localStorage.getItem("sessionID"); // Retrieve sessionID manually

            if (!sessionID) {
                console.error("❌ No session ID found in localStorage.");
                setError("No session ID found.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("/.netlify/functions/getUserTeams", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "sessionID": sessionID, // Send sessionID manually
                    },
                });

                console.log("Raw Response:", response);

                if (!response.ok) {
                    throw new Error("Failed to fetch teams.");
                }

                const data = await response.json();
                console.log("Fetched Teams Data:", data);

                setTeams(data);
            } catch (err) {
                console.error("Error fetching teams:", err);
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
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
        }}>
            <h2>Your Teams</h2>
            {teams.length === 0 ? (
                <p>You are not in any teams.</p>
            ) : (
                <ul style={{
                    listStyle: "none",
                    padding: 0,
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "left"
                }}>
                    {teams.map((team) => (
                        <li key={team.id} style={{
                            padding: "10px",
                            margin: "5px 0",
                            backgroundColor: "#222",
                            color: "white",
                            borderRadius: "5px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span>{team.name}</span>
                            <button
                                style={{
                                    padding: "5px 10px",
                                    fontSize: "12px",
                                    backgroundColor: "#d9534f",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}
                                onClick={() => console.log("Clicked on team:", team.name)}
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
