import React, {useEffect, useState} from "react";
import {
    Button, Dialog, DialogActions, DialogContent, Stack, TextField, IconButton, AvatarGroup, Avatar
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import {styled} from "@mui/material/styles";
import axios from "axios";
import Cookies from "js-cookie";


// ✅ Styled Dialog Paper Component
const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        border: "1px solid #444444", // ✅ Adds the outline
        borderRadius: "4px",
    }
}));

const EditTeamDialog = ({open, handleClose, team, onSave}) => {
    const [teamName, setTeamName] = useState(team.team_name);
    const [teamIconUrl, setTeamIconUrl] = useState(team.team_icon_url || ""); // ✅ Added icon URL state
    const [newMember, setNewMember] = useState("");
    const [githubIds, setGithubIds] = useState([...team.github_ids]);
    const [githubUsers, setGithubUsers] = useState({}); // Stores { id: login }

    // Fetch GitHub usernames when IDs change
    useEffect(() => {
        const fetchGitHubUsernames = async () => {
            const userPromises = githubIds.map(async (id) => {
                try {
                    const response = await axios.get(`https://api.diabolical.studio/rest-api/users/github/${id}`);
                    return {id, username: response.data.username};
                } catch (error) {
                    console.error(`Error fetching GitHub username for ID ${id}:`, error);
                    return {id, username: `Unknown-${id}`};
                }
            });

            const users = await Promise.all(userPromises);
            const usersMap = Object.fromEntries(users.map(user => [user.id, user.username]));
            setGithubUsers(usersMap);
        };

        fetchGitHubUsernames();
    }, [githubIds]);

    const handleAddMember = () => {
        if (newMember.trim() !== "" && !githubIds.includes(newMember)) {
            setGithubIds([...githubIds, newMember]);
            setNewMember("");
        }
    };

    const handleSave = async () => {
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            return;
        }

        const updatedTeam = {
            team_id: team.team_id,
            team_name: teamName.trim(),
            team_icon_url: teamIconUrl.trim(),
            github_ids: githubIds.map(id => String(id)) // Ensure IDs are sent as strings
        };

        console.log("📤 Sending team update request:", updatedTeam); // ✅ Log the request payload

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/updateTeam", {
                method: "PUT", headers: {
                    "Content-Type": "application/json", "sessionID": sessionID
                }, body: JSON.stringify(updatedTeam) // ✅ Convert to JSON
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Server Error Response:", data);
                throw new Error("Failed to update team.");
            }

            console.log("✅ Team updated successfully:", data);
            onSave({
                ...team,
                team_name: teamName,
                team_icon_url: teamIconUrl,
                github_ids: [...githubIds] // ✅ Ensure updated GitHub IDs are passed
            });
            handleClose();
        } catch (err) {
            console.error("❌ Error updating team:", err);
        }
    };

    return (<StyledDialog open={open} onClose={handleClose} aria-labelledby="edit-team-dialog-title">
        {/*<DialogTitle className={"dialog"} id="edit-team-dialog-title">Edit Team: {team.team_name}</DialogTitle>*/}
        <DialogContent className={"dialog"} style={{padding: "12px", backdropFilter: "invert(1)"}}>
            <Stack spacing={2}>
                {/* Edit Team Name - MUI TextField */}
                <TextField
                    label="Team Name"
                    color="secondary"
                    focused
                    fullWidth
                    placeholder="Very Cool Team Name"

                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    sx={{
                        borderRadius: "8px",

                        "& .MuiOutlinedInput-root": {
                            backgroundColor: "#000", // Input background color
                            color: "#fff", border: "none",
                        }, "& .MuiOutlinedInput-notchedOutline": {
                            border: "1px solid #444444 !important", borderRadius: "2px"
                        }, "& .MuiFormLabel-root": {
                            color: "#444444 !important",
                        }
                    }}
                />


                {/* ✅ Edit Team Icon URL Field */}
                <TextField
                    label="Team Icon URL"
                    color="secondary"
                    focused
                    multiline
                    fullWidth
                    placeholder="example.com/image.png"
                    value={teamIconUrl}
                    onChange={(e) => setTeamIconUrl(e.target.value)}
                    sx={{
                        borderRadius: "8px", "& .MuiOutlinedInput-root": {
                            backgroundColor: "#000", // Input background color
                            color: "#fff", border: "none",
                        }, "& .MuiOutlinedInput-notchedOutline": {
                            border: "1px solid #444444 !important", borderRadius: "2px"
                        }, "& .MuiFormLabel-root": {
                            color: "#444444 !important",
                        }
                    }}
                />

                {/* Add GitHub Member - MUI TextField with Button */}
                <Stack direction="row" spacing={"12px"} alignItems="center">
                    <TextField
                        label="GitHub ID"
                        color="secondary"
                        focused
                        fullWidth
                        placeholder="151235"

                        value={newMember}
                        onChange={(e) => setNewMember(e.target.value)}
                        sx={{
                            borderRadius: "8px", "& .MuiOutlinedInput-root": {
                                backgroundColor: "#000", // Input background color
                                color: "#fff", border: "none",
                            }, "& .MuiOutlinedInput-notchedOutline": {
                                border: "1px solid #444444 !important", borderRadius: "2px"
                            }, "& .MuiFormLabel-root": {
                                color: "#444444 !important",
                            }
                        }}
                    />
                    <IconButton sx={{
                        color: "#fff !important",
                        backgroundColor: "#121212 !important",
                        outline: "1px solid #444444",
                        borderRadius: "2px "
                    }} onClick={handleAddMember}
                                style={{height: "100%", borderRadius: "2px",}} aria-label="add"
                                color="primary">
                        <AddIcon/>
                    </IconButton>
                </Stack>

                <Stack flexDirection={"row-reverse"}>
                    <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 32, height: 32, borderColor: "#444444"}}}>
                        {githubIds.map(id => (
                            <Avatar
                                key={id}
                                alt={`GitHub User ${githubUsers[id] || id}`}
                                src={`https://avatars.githubusercontent.com/u/${id}`}
                                title={`${githubUsers[id] || "Loading..."}`} // 👈 Shows login name on hover
                            />
                        ))}
                    </AvatarGroup>
                </Stack>

            </Stack>
        </DialogContent>
        <DialogActions className={"dialog"} style={{padding: "12px"}}>
            {/*<Button onClick={handleClose}>Cancel</Button>*/}
            <Button sx={{
                color: "#fff !important",
                backgroundColor: "#121212 !important",
                outline: "1px solid #444444",
                borderRadius: "2px",
            }} onClick={handleSave}
                    style={{height: "100%", borderRadius: "2px", width: "-webkit-fill-available",}} aria-label="add"
                    color="primary" startIcon={<SaveIcon/>}>
                Save
            </Button>
        </DialogActions>
    </StyledDialog>);
};

export default EditTeamDialog;
