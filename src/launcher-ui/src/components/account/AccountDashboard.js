import React, { useEffect, useState } from "react";
import Teams from "./Teams";
import AccountName from "./AccountName";
import LogoutButton from "./LogoutButton";
import Grid from "../Grid";
import Games from "./Games";
import Divider from "../Divider";
import ImageButton from "../button/ImageButton";

const AccountDashboard = ({ username }) => {
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [errorTeams, setErrorTeams] = useState(null);
    const [activeTab, setActiveTab] = useState("teams"); // Tracks selected tab
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

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "-webkit-fill-available" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backdropFilter: "blur(5px)",
                    backgroundColor: "transparent",
                    padding: "12px",
                }}
            >
                <AccountName username={username} />
                <LogoutButton />
            </div>

            <Divider />

            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", overflow: "hidden" }}>
                <ul
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        height: "-webkit-fill-available",
                        width: "20%",
                        padding: "12px",
                        margin: 0,
                    }}
                >
                    <ImageButton
                        text="Teams"
                        imageSrc="MenuIcons/teams.png"
                        onClick={() => handleTabClick("teams")}
                        active={activeTab === "teams"}
                    />
                    <ImageButton
                        text="My Games"
                        imageSrc="MenuIcons/games.png"
                        onClick={() => handleTabClick("games")}
                        active={activeTab === "games"}
                    />
                </ul>
                <Divider vertical={true} />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        height: "-webkit-fill-available",
                        width: "-webkit-fill-available",
                        marginTop: 0,
                    }}
                >
                    <Grid>
                        {activeTab === "teams" && <Teams teams={teams} loading={loadingTeams} error={errorTeams} />}
                        {activeTab === "games" && <Games teams={teams} />}
                    </Grid>
                </div>
            </div>
        </div>
    );
};

export default AccountDashboard;
