import React, {useEffect, useState} from "react";
import {Chip, Stack, TextField, Zoom} from "@mui/material";
import EditGameCard from "./EditGameCard";
import Divider from "../Divider";
import GameCardsSkeleton from "../skeleton/GameCardsSkeleton";
import {colors} from "../../theme/colors";
import GameInfoPanel from "./GameInfoPanel";

const Games = ({teams}) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTeams, setCurrentTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [deploymentStatuses, setDeploymentStatuses] = useState({});

    const handleChipClick = (teamName) => {
        setSelectedTeams((prevSelected) => prevSelected.includes(teamName) ? prevSelected.filter((name) => name !== teamName) : [...prevSelected, teamName]);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const handleSaveGameChanges = (updatedGame) => {
        console.log("✅ Updating Game in UI:", updatedGame);

        setGames((prevGames) => prevGames.map((game) => game.game_id === updatedGame.game_id ? {...game, ...updatedGame} : game));
    };

    const filterGames = () => {
        return games.filter((game) => {
            const gameName = game.game_name || "";
            const matchesTeam = selectedTeams.length === 0 || selectedTeams.includes(game.team_name);
            const matchesSearch = gameName
                .toLowerCase()
                .includes(searchQuery);
            return matchesTeam && matchesSearch;
        });
    };

    const checkDeploymentStatus = async (game) => {
        // Find the installation ID and access token for this game's owner
        let installationId = null;
        let accessToken = null;
        //let count = 1;

        /* while (true) {
            const currentInstallationId = Cookies.get(`githubInstallationId${count}`);
            const currentAccessToken = Cookies.get(`githubAccessToken${count}`);
            
            if (!currentInstallationId || !currentAccessToken) break;

            // Check if this installation has access to the game's repo
            try {
                const response = await fetch(`https://api.github.com/repos/${game.github_repo}`, {
                    headers: {
                        Authorization: `Bearer ${currentAccessToken}`,
                        Accept: "application/vnd.github+json",
                    },
                });

                if (response.ok) {
                    installationId = currentInstallationId;
                    accessToken = currentAccessToken;
                    break;
                }
            } catch (err) {
                console.error(`Error checking repo access for installation ${count}:`, err);
            }

            count++;
        } */

        if (!installationId || !accessToken) {
            setDeploymentStatuses(prev => ({
                ...prev,
                [game.game_id]: { status: 'unknown', message: 'No GitHub access found' }
            }));
            return;
        }

        try {
            // Check deployment status
            const response = await fetch(`https://api.github.com/repos/${game.github_repo}/deployments`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github+json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch deployments: ${response.status}`);
            }

            const deployments = await response.json();
            const latestDeployment = deployments[0];

            if (!latestDeployment) {
                setDeploymentStatuses(prev => ({
                    ...prev,
                    [game.game_id]: { status: 'not_deployed', message: 'No deployments found' }
                }));
                return;
            }

            // Get deployment status
            const statusResponse = await fetch(latestDeployment.statuses_url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github+json",
                },
            });

            if (!statusResponse.ok) {
                throw new Error(`Failed to fetch deployment status: ${statusResponse.status}`);
            }

            const statuses = await statusResponse.json();
            const latestStatus = statuses[0];

            setDeploymentStatuses(prev => ({
                ...prev,
                [game.game_id]: {
                    status: latestStatus?.state || 'unknown',
                    message: latestStatus?.description || 'Status unknown'
                }
            }));
        } catch (err) {
            console.error(`Error checking deployment status for ${game.game_id}:`, err);
            setDeploymentStatuses(prev => ({
                ...prev,
                [game.game_id]: { status: 'error', message: 'Failed to check status' }
            }));
        }
    };

    useEffect(() => {
        if (teams && teams.length > 0) {
            setCurrentTeams(teams);
        }
    }, [teams]);

    useEffect(() => {
        console.log("🔄 Checking teams state:", currentTeams);

        if (!currentTeams || currentTeams.length === 0) {
            console.log("⏳ Waiting for teams to load...");
            return;
        }

        const fetchGames = async () => {
            try {
                let allGames = [];

                for (const team of currentTeams) {
                    if (!team.team_name) continue;

                    console.log(`🎯 Fetching games for team: ${team.team_name}`);

                    try {
                        const response = await fetch(`/get-user-games?team_name=${encodeURIComponent(team.team_name)}`, {
                            method: "GET", headers: {"Content-Type": "application/json"}
                        });

                        if (!response.ok) {
                            console.warn(`⚠️ No games found or failed request for team ${team.team_name}. Status: ${response.status}`);
                            continue; // Skip this team
                        }

                        const data = await response.json();
                        console.log(`✅ Games for ${team.team_name}:`, data);

                        allGames = [...allGames, ...data];
                    } catch (teamErr) {
                        console.error(`❌ Failed to load games for team ${team.team_name}:`, teamErr);
                        continue; // Skip just this team
                    }
                }

                setGames(allGames);
            } catch (err) {
                console.error("❌ General error in fetchGames:", err);
                setError("Something went wrong while loading games.");
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [currentTeams]);

    useEffect(() => {
        // Check deployment status for all games when they're loaded
        if (games.length > 0) {
            games.forEach(game => {
                if (game.github_repo) {
                    checkDeploymentStatus(game);
                }
            });
        }
    }, [games]);

    if (!teams || teams.length === 0) return <p>⏳ Waiting for teams to load...</p>;
    if (loading) return <GameCardsSkeleton/>;
    if (error) return <p style={{color: "red"}}>{error}</p>;

    return (<Stack className={"overflow-hidden"}>
        <Stack
            className={"dialog w-full items-center justify-between p-3 min-h-fit"}
            direction={"row"}
            style={{
                backgroundColor: colors.transparent,
            }}
        >
            <Stack direction={"row"} className={"gap-3 flex-wrap items-center w-1/2"}>
                {teams.map((team) => (<Chip
                    key={team.team_name}
                    label={team.team_name}
                    onClick={() => handleChipClick(team.team_name)}
                    color={selectedTeams.includes(team.team_name) ? "primary" : "default"}
                    style={{
                        color: colors.text, borderRadius: "2px", outline: "1px solid" + colors.border,
                    }}
                />))}
            </Stack>
            <TextField
                style={{width: "50%"}}
                label="Search Games"
                variant="outlined"
                fullWidth
                onChange={handleSearchChange}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        color: colors.text, fontSize: "16px",
                    }, "& .MuiOutlinedInput-notchedOutline": {
                        border: "1px solid" + colors.border + "!important", borderRadius: "2px", color: colors.text,
                    }, "& .MuiFormLabel-root": {
                        color: colors.text,
                    },
                }}
            />
        </Stack>

        <Divider/>

        {games.length === 0 ? (<p>You did not create any Games.</p>) : (<Stack
            className={"flex p-3 overflow-auto flex-col gap-3"}
        >
            {filterGames().map((game, index) => (<Zoom
                key={game.game_id}
                in={!loading}
                timeout={300 + index * 100}
            >
                <Stack className={"gap-3"} direction={"row"}>
                    <div>
                        <EditGameCard
                            game={game}
                            isInstalled={false}
                            onUpdateGame={handleSaveGameChanges}
                            deploymentStatus={deploymentStatuses[game.game_id]}
                        />
                    </div>
                    <GameInfoPanel 
                        game={game}
                        deploymentStatus={deploymentStatuses[game.game_id]}
                    />
                </Stack>
            </Zoom>))}
        </Stack>)}
    </Stack>);
};

export default Games;
