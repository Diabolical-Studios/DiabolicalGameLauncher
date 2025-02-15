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

                    const response = await fetch(`/.netlify/functions/getUserGames?team_name=${encodeURIComponent(team.team_name)}`, {
                        method: "GET", headers: {"Content-Type": "application/json"},
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch games for team ${team.team_name}.`);
                    }

                    const data = await response.json();
                    console.log(`✅ Games for ${team.team_name}:`, data);

                    allGames = [...allGames, ...data];
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
    }, [currentTeams]);

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
                    icon={team.team_icon_url}
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
                        />
                    </div>
                    <GameInfoPanel game={game}/> {/* Now correctly passing game data */}
                </Stack>
            </Zoom>))}
        </Stack>)}
    </Stack>);
};

export default Games;
