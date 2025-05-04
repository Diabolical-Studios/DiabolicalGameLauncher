import React, {useEffect, useMemo, useState} from "react";
import {Avatar, AvatarGroup, Stack} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import OnlyImageButton from "../button/OnlyImageButton";
import InfiniteGameScroller from "../InfiniteGameScroller";
import EditTeamDialog from "./dialogs/EditTeamDialog";
import InfiniteGameSkeleton from "../skeleton/InfiniteScrollerSkeleton";
import {colors} from "../../theme/colors";

const TeamCard = ({team, onUpdateTeam}) => {
    const [games, setGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [errorGames, setErrorGames] = useState(null);
    const [githubAvatars, setGithubAvatars] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const fetchGames = useMemo(() => async () => {
        if (!team.team_name) return;
        console.log(`🎯 Fetching games for team: ${team.team_name}`);

        try {
            const response = await fetch(`/get-user-games?team_name=${encodeURIComponent(team.team_name)}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch games for team ${team.team_name}.`);
            }

            const data = await response.json();
            console.log(`✅ Games for ${team.team_name}:`, data);
            setGames(data);
        } catch (err) {
            console.error("❌ Error fetching games:", err);
            setErrorGames("No Games Found!");
        } finally {
            setLoadingGames(false);
        }
    }, [team.team_name]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    useEffect(() => {
        if (!team.github_ids || team.github_ids.length === 0) return;

        const avatars = team.github_ids.map(id => ({
            id, avatar_url: `https://avatars.githubusercontent.com/u/${id}?v=4`,
        }));

        setGithubAvatars(avatars);
    }, [team.github_ids]);

    const handleSaveTeamChanges = (updatedTeam) => {
        console.log("✅ Updating Team in UI:", updatedTeam);

        if (typeof onUpdateTeam === "function") {
            onUpdateTeam(updatedTeam);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const listStyle = {
        aspectRatio: isMobile ? false : "1", backgroundColor: colors.background, borderColor: colors.border,

    };

    return (<li className={"gap-3 flex flex-col justify-between border rounded-sm"} style={listStyle}>
        <Stack className={"h-full gap-3 p-3 justify-between flex-col flex"}>
            {/* Team Header */}
            <Stack flexDirection="row" justifyContent="space-between" alignItems="center" spacing={"12px"}>
                <Stack flexDirection="row" alignItems="center" gap="12px">
                    <Avatar
                        src={`${team.team_icon_url}?t=${Date.now()}`}
                        alt={team.team_name}
                        variant="square"
                        sx={{width: 32, height: 32, "& img": {objectFit: "scale-down"}}}
                    />
                    <span style={{lineHeight: 1}}>{team.team_name}</span>
                </Stack>
                <OnlyImageButton icon={EditIcon} onClick={() => setEditOpen(true)}/>
            </Stack>

            {/* Infinite Scrolling Games */}
            {loadingGames ? (<InfiniteGameSkeleton/>) : errorGames ? (
                <p style={{color: "red", textAlign: "center"}}>{errorGames}</p>) : (
                <InfiniteGameScroller games={games}/>)}

            {/* Team Members - GitHub Profile Pictures */}
            <Stack flexDirection={"row-reverse"}>
                <AvatarGroup max={4}
                             sx={{
                                 "& .MuiAvatar-root": {
                                     width: 32, height: 32, borderColor: colors.border,
                                 }, "& .MuiAvatarGroup-avatar": {
                                     backgroundColor: colors.background, // 👈 Change this to your desired color
                                     color: colors.text, // Text color
                                     fontSize: "14px"
                                 }
                             }}>
                    {githubAvatars.map(member => (
                        <Avatar key={member.id} alt={`GitHub User ${member.id}`} src={member.avatar_url}/>))}
                </AvatarGroup>
            </Stack>
        </Stack>

        {/* Edit Team Dialog */}
        <EditTeamDialog
            open={editOpen}
            handleClose={() => setEditOpen(false)}
            team={team}
            onSave={handleSaveTeamChanges}
        />
    </li>);
};

export default TeamCard;
