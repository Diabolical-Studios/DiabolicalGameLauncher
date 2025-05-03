// AccountDashboard.js
import React, {useCallback, useEffect, useState} from "react";
import {Link, Route, Routes} from "react-router-dom";
import Cookies from "js-cookie";
import {Avatar, Stack} from "@mui/material";
import Teams from "./Teams";
import Games from "./Games";
import AccountName from "./AccountName";
import Grid from "../Grid";
import Divider from "../Divider";
import ImageButton from "../button/ImageButton";
import DiabolicalSpeedDial from "../button/DiabolicalSpeedDial";
import GroupsIcon from "@mui/icons-material/Groups";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import {colors} from "../../theme/colors";
import AccountSettings from "./AccountSettings";

export default function AccountDashboard({username}) {
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [errorTeams, setErrorTeams] = useState(null);
    const githubId = Cookies.get("githubID");
    const githubAvatar = githubId ? `https://avatars.githubusercontent.com/u/${githubId}?v=4` : null;

    const fetchTeams = useCallback(async () => {
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            setErrorTeams("No session ID found.");
            setLoadingTeams(false);
            return;
        }
        try {
            const response = await fetch("/get-user-teams", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    sessionID: sessionID,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch teams.");
            }
            const data = await response.json();
            setTeams(data);
        } catch (err) {
            setErrorTeams("Failed to load teams.");
        } finally {
            setLoadingTeams(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleUpdateTeam = (updatedTeam) => {
        setTeams((prev) =>
            prev.map((team) =>
                team.team_id === updatedTeam.team_id ? {...team, ...updatedTeam} : team
            )
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div
                className="flex justify-between align-center backdrop-blur p-3"
                style={{
                    backgroundColor: colors.transparent,
                    borderBottom: "1px solid" + colors.border,
                }}
            >
                <Stack direction="row" spacing="12px" justifyContent="center" alignItems="center">
                    <Avatar
                        alt="GitHub User"
                        src={githubAvatar || "/static/images/avatar/1.jpg"}
                        sx={{width: 32, height: 32, outline: "1px solid" + colors.border}}
                    />
                    <AccountName username={username}/>
                </Stack>
            </div>
            <div className="w-full h-full flex overflow-hidden">
                <ul className="flex flex-col gap-3 h-full w-1/5 p-3 m-0 justify-between">
                    <Stack direction="column" spacing="12px">
                        <Link to="/account/dashboard/settings">
                            <ImageButton style={{width: "100%"}} text="Account" icon={GroupsIcon}/>
                        </Link>
                        <Link to="/account/dashboard/teams">
                            <ImageButton style={{width: "100%"}} text="Teams" icon={GroupsIcon}/>
                        </Link>
                        <Link to="/account/dashboard/games">
                            <ImageButton style={{width: "100%"}} text="Games" icon={VideogameAssetIcon}/>
                        </Link>
                    </Stack>
                    <DiabolicalSpeedDial onCreateTeam={fetchTeams} teams={teams}/>
                </ul>
                <Divider vertical/>
                <div className="flex flex-col gap-3 size-full mt-0">
                    <Routes>
                        <Route
                            index
                            element={
                                <Grid>
                                    <Teams
                                        teams={teams}
                                        loading={loadingTeams}
                                        error={errorTeams}
                                        onUpdateTeam={handleUpdateTeam}
                                    />
                                </Grid>
                            }
                        />
                        <Route
                            path="settings"
                            element={
                                <Grid>
                                    <AccountSettings username={username}/>
                                </Grid>
                            }
                        />
                        <Route
                            path="teams"
                            element={
                                <Grid>
                                    <Teams
                                        teams={teams}
                                        loading={loadingTeams}
                                        error={errorTeams}
                                        onUpdateTeam={handleUpdateTeam}
                                    />
                                </Grid>
                            }
                        />
                        <Route
                            path="games"
                            element={
                                <Grid>
                                    <Games teams={teams}/>
                                </Grid>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
