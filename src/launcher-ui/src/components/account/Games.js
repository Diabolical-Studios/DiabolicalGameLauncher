import React, {useEffect, useState} from "react";
import {Chip, TextField, Stack} from "@mui/material";
import EditGameCard from "./EditGameCard";
import Divider from "../Divider";
import GameCardsSkeleton from "../skeleton/GameCardsSkeleton";


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

    const filterGames = () => {
        return games.filter((game) => {
            const gameName = game.game_name || ""; // Ensure game.name is always a string
            const matchesTeam = selectedTeams.length === 0 || selectedTeams.includes(game.team_name);
            const matchesSearch = gameName.toLowerCase().includes(searchQuery);
            return matchesTeam && matchesSearch;
        });
    };


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

                    const response = await fetch(`https://launcher.diabolical.studio/.netlify/functions/getUserGames?team_name=${encodeURIComponent(team.team_name)}`, {
                        method: "GET", headers: {"Content-Type": "application/json"},
                    });

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
    if (loading) return <GameCardsSkeleton />;
    if (error) return <p style={{color: "red"}}>{error}</p>;

    return (<div style={{display: "flex", flexDirection: "column",}}>
        <Stack className={"dialog"} style={{
            width: '-webkit-fill-available',
            display: "flex",
            flexDirection: "row",
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px",

        }}>
            <Stack sx={{display: 'flex', flexDirection: "row", gap: "12px", flexWrap: 'wrap', alignItems: "center", width: "50%"}}>
                {teams.map((team) => (<Chip
                    icon={team.team_icon_url}
                    key={team.team_name}
                    label={team.team_name}
                    onClick={() => handleChipClick(team.team_name)}
                    color={selectedTeams.includes(team.team_name) ? 'primary' : 'default'}
                    style={{color: "#fff", borderRadius: "2px", outline: "1px solid #444444"}}

                />))}
            </Stack>
            <TextField style={{width: '50%'}}
                       label="Search Games"
                       variant="outlined"
                       fullWidth
                       onChange={handleSearchChange}
                       sx={{
                           "& .MuiOutlinedInput-root": {
                               color: "#fff",
                               fontFamily: "'Consolas', sans-serif !important",
                               fontSize: "16px",
                           },
                           "& .MuiOutlinedInput-notchedOutline": {
                               border: "1px solid #444444 !important",
                               borderRadius: "2px"
                           },
                           "& .MuiFormLabel-root": {
                               color: "#fff",
                           },
                       }}
            />
        </Stack>

        <Divider/>

        {games.length === 0 ? (<p>You did not create any Games.</p>) : (
            <div id="game-cards-container" style={{padding: "12px", overflow: "hidden", gridTemplateColumns: "repeat(3, minmax(250px, 1fr))"}}>
                {filterGames().map((game, index) => (<EditGameCard key={index} game={game} isInstalled={false}/>))}
            </div>)}
    </div>);
};

export default Games;
