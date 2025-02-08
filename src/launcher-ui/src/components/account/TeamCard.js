import React, {useEffect, useState, useMemo} from "react";
import {Avatar, AvatarGroup, Stack} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import OnlyImageButton from "../button/OnlyImageButton";
import InfiniteGameScroller from "../InfiniteGameScroller";
import EditTeamDialog from "./dialogs/EditTeamDialog"; // ✅ Import the dialog

const TeamCard = ({team, onUpdateTeam}) => {
    const [games, setGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [errorGames, setErrorGames] = useState(null);
    const [githubAvatars, setGithubAvatars] = useState([]);
    const [editOpen, setEditOpen] = useState(false); // ✅ Control dialog state

    // 🔹 Fetch games for the team
    const fetchGames = useMemo(() => async () => {
        if (!team.team_name) return;
        console.log(`🎯 Fetching games for team: ${team.team_name}`);

        try {
            const response = await fetch(`https://launcher.diabolical.studio/.netlify/functions/getUserGames?team_name=${encodeURIComponent(team.team_name)}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch games for team ${team.team_name}.`);
            }

            const data = await response.json();
            console.log(`✅ Games for ${team.team_name}:`, data);
            setGames(data);
        } catch (err) {
            console.error("❌ Error fetching games:", err);
            setErrorGames("Failed to load games.");
        } finally {
            setLoadingGames(false);
        }
    }, [team.team_name]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    // 🔹 Fetch GitHub profile pictures
    useEffect(() => {
        if (!team.github_ids || team.github_ids.length === 0) return;

        // Properly format GitHub avatar URLs
        const avatars = team.github_ids.map(id => ({
            id, avatar_url: `https://avatars.githubusercontent.com/u/${id}?v=4`,
        }));

        setGithubAvatars(avatars);
    }, [team.github_ids]);

    const handleSaveTeamChanges = (updatedTeam) => {
        console.log("✅ Updating Team in UI:", updatedTeam);

        if (typeof onUpdateTeam === "function") {
            onUpdateTeam(updatedTeam); // ✅ Call parent function to update the teams list
        }
    };

    return (<li style={{
        gap: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        aspectRatio: "1/1",
        backgroundColor: "#000",
        border: "1px solid rgb(48, 48, 48)"
    }}>
        <Stack flexDirection={"column"} justifyContent={"space-between"} padding={"12px"} gap={"12px"}
               height={"-webkit-fill-available"}>

            {/* Team Header */}
            <Stack flexDirection="row" justifyContent="space-between" alignItems="center" spacing={"12px"}>
                <Stack flexDirection="row" alignItems="center" gap="12px">
                    <Avatar
                        src={team.team_icon_url}
                        alt={team.team_name}
                        variant="square"
                        sx={{width: 32, height: 32, "& img": {objectFit: "scale-down"}}}
                    />
                    <span style={{lineHeight: 1}}>{team.team_name}</span>
                </Stack>
                <OnlyImageButton icon={EditIcon} onClick={() => setEditOpen(true)} />
            </Stack>

            {/* Infinite Scrolling Games */}
            {loadingGames ? (<p>Loading games...</p>) : errorGames ? (<p style={{color: "red"}}>{errorGames}</p>) : (
                <InfiniteGameScroller games={games}/>)}

            {/* Team Members - GitHub Profile Pictures */}
            <Stack flexDirection={"row-reverse"} padding={"12px"}>
                <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 32, height: 32, borderColor: "#444444"}}}>
                    {githubAvatars.map(member => (
                        <Avatar key={member.id} alt={`GitHub User ${member.id}`} src={member.avatar_url}/>))}
                </AvatarGroup>
            </Stack>
        </Stack>

        {/* ✅ Edit Team Dialog */}
        <EditTeamDialog
            open={editOpen}
            handleClose={() => setEditOpen(false)}
            team={team}
            onSave={handleSaveTeamChanges}
        />

    </li>);
};

export default TeamCard;
