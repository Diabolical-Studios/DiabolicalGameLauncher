import React, { useState, useEffect, useCallback } from "react";
import Teams from "./Teams";
import AccountName from "./AccountName";
import LogoutButton from "./LogoutButton";
import Grid from "../Grid";
import Games from "./Games";
import Divider from "../Divider";
import ImageButton from "../button/ImageButton";
import { Avatar, Stack } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import DiabolicalSpeedDial from "../button/DiabolicalSpeedDial";
import Cookies from "js-cookie";


const AccountDashboard = ({ username }) => {
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [errorTeams, setErrorTeams] = useState(null);
    const [activeTab, setActiveTab] = useState("teams");
    const [githubAvatar, setGithubAvatar] = useState(null);

    const fetchTeams = useCallback(async () => {
        const sessionID = Cookies.get("sessionID");

        if (!sessionID) {
            console.error("❌ No session ID found in cookies.");
            setErrorTeams("No session ID found.");
            setLoadingTeams(false);
            return;
        }

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/getUserTeams", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID, // ✅ Use session from cookies
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch teams.");
            }

            const data = await response.json();
            console.log("✅ Fetched Teams Data:", data);
            setTeams(data);

            if (data.length > 0 && data[0].github_ids) {
                const userGithubID = data[0].github_ids.find(id => id);
                if (userGithubID) {
                    setGithubAvatar(`https://avatars.githubusercontent.com/u/${userGithubID}?v=4`);
                }
            }
        } catch (err) {
            console.error("❌ Error fetching teams:", err);
            setErrorTeams("Failed to load teams.");
        } finally {
            setLoadingTeams(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleUpdateTeam = (updatedTeam) => {
        setTeams((prevTeams) =>
            prevTeams.map((team) =>
                team.team_id === updatedTeam.team_id ? { ...team, ...updatedTeam } : team
            )
        );
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "-webkit-fill-available" }}>
            {/* Top Bar */}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(5px)", backgroundColor: "transparent", padding: "12px" }}>
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <Avatar
                        alt="GitHub User"
                        src={githubAvatar || "/static/images/avatar/1.jpg"}
                        sx={{ width: 32, height: 32, outline: "1px solid #444444" }}
                    />
                    <AccountName username={username} />
                </Stack>
                <LogoutButton />
            </div>

            <Divider />

            {/* Main Content */}
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", overflow: "hidden" }}>
                {/* Sidebar Navigation */}
                <ul style={{ display: "flex", flexDirection: "column", gap: "12px", height: "-webkit-fill-available", width: "20%", padding: "12px", margin: 0, justifyContent: "space-between" }}>
                    <Stack direction="column" spacing={"12px"}>
                        <ImageButton text="Teams" icon={GroupsIcon} onClick={() => setActiveTab("teams")} />
                        <ImageButton text="Games" icon={VideogameAssetIcon} onClick={() => setActiveTab("games")} />
                    </Stack>

                    <DiabolicalSpeedDial onCreateTeam={fetchTeams} teams={teams} setActiveTab={setActiveTab} />
                </ul>

                <Divider vertical={true} />

                {/* Content Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "-webkit-fill-available", width: "-webkit-fill-available", marginTop: 0 }}>
                    <Grid>
                        {activeTab === "teams" && <Teams teams={teams} loading={loadingTeams} error={errorTeams} onUpdateTeam={handleUpdateTeam} />}
                        {activeTab === "games" && <Games teams={teams} />}
                    </Grid>
                </div>
            </div>
        </div>
    );
};

export default AccountDashboard;
