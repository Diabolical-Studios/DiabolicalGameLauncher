import React, { useEffect, useState } from "react";
import Teams from "./Teams";
import AccountName from "./AccountName";
import LogoutButton from "./LogoutButton";
import Grid from "../Grid";
import Games from "./Games";

const AccountDashboard = ({ username }) => {
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [errorTeams, setErrorTeams] = useState(null);
    const sessionID = localStorage.getItem("sessionID");

    useEffect(() => {
        const fetchTeams = async () => {
            if (!sessionID) {
                console.error("❌ No session ID found in localStorage.");
                setErrorTeams("No session ID found.");
                setLoadingTeams(false);
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

                setTeams(data);
            } catch (err) {
                console.error("❌ Error fetching teams:", err);
                setErrorTeams("Failed to load teams.");
            } finally {
                setLoadingTeams(false);
            }
        };

        fetchTeams();
    }, [sessionID]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
            <div
                style={{
                    padding: "4px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backdropFilter: "blur(5px)",
                    backgroundColor: "transparent",
                }}
            >
                <AccountName username={username} />
                <LogoutButton />
            </div>

            <Grid>
                <Teams teams={teams} loading={loadingTeams} error={errorTeams} />
                <Games teams={teams} />
            </Grid>
        </div>
    );
};

export default AccountDashboard;
