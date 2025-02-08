import React, { useState } from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Box, FormControl, InputLabel
} from "@mui/material";
import { styled } from "@mui/material/styles";
import InputBase from '@mui/material/InputBase';

// ✅ Styled Dialog Paper Component
const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        border: "1px solid #444444", // ✅ Adds the outline
        borderRadius: "4px",
    }
}));

// ✅ Bootstrap Styled Input
const BootstrapInput = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        borderRadius: 4,
        position: 'relative',
        backgroundColor: '#F3F6F9',
        border: '1px solid',
        borderColor: '#E0E3E7',
        fontSize: 16,
        width: '100%',
        padding: '10px 12px',
        transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(','),
        '&:focus': {
            boxShadow: `0 0 0 0.2rem ${theme.palette.primary.light}`,
            borderColor: theme.palette.primary.main,
        },
    },
}));

const EditTeamDialog = ({ open, handleClose, team, onSave }) => {
    const [teamName, setTeamName] = useState(team.team_name);
    const [teamIconUrl, setTeamIconUrl] = useState(team.team_icon_url || ""); // ✅ Added icon URL state
    const [newMember, setNewMember] = useState("");
    const [githubIds, setGithubIds] = useState([...team.github_ids]);

    const handleAddMember = () => {
        if (newMember.trim() !== "" && !githubIds.includes(newMember)) {
            setGithubIds([...githubIds, newMember]);
            setNewMember("");
        }
    };

    const handleSave = async () => {
        const sessionID = localStorage.getItem("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            return;
        }

        const updatedTeam = {
            team_id: team.team_id,
            team_name: teamName.trim(),  // ✅ Trim whitespace
            team_icon_url: teamIconUrl.trim() // ✅ Trim whitespace
        };

        console.log("📤 Sending team update request:", updatedTeam); // ✅ Log the request payload

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/updateTeam", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID
                },
                body: JSON.stringify(updatedTeam) // ✅ Convert to JSON
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Server Error Response:", data);
                throw new Error("Failed to update team.");
            }

            console.log("✅ Team updated successfully:", data);
            onSave({ ...team, team_name: teamName, team_icon_url: teamIconUrl });
            handleClose();
        } catch (err) {
            console.error("❌ Error updating team:", err);
        }
    };


    return (
        <StyledDialog open={open} onClose={handleClose} aria-labelledby="edit-team-dialog-title">
            <DialogTitle className={"dialog"} id="edit-team-dialog-title">Edit Team: {team.team_name}</DialogTitle>
            <DialogContent className={"dialog"} style={{ padding: "12px", backdropFilter: "invert(1)" }}>
                <Stack spacing={2}>
                    {/* Edit Team Name - Bootstrap Styled Input */}
                    <FormControl variant="standard">
                        <InputLabel shrink htmlFor="team-name-input">Team Name</InputLabel>
                        <BootstrapInput
                            id="team-name-input"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                    </FormControl>

                    {/* ✅ Edit Team Icon URL Field */}
                    <FormControl variant="standard">
                        <InputLabel shrink htmlFor="team-icon-url-input">Team Icon URL</InputLabel>
                        <BootstrapInput
                            id="team-icon-url-input"
                            value={teamIconUrl}
                            onChange={(e) => setTeamIconUrl(e.target.value)}
                        />
                    </FormControl>

                    {/* Add GitHub Member - Bootstrap Styled Input with Icon */}
                    <Stack direction="row" spacing={"12px"} alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                <InputLabel shrink htmlFor="github-member-input">GitHub ID</InputLabel>
                                <BootstrapInput
                                    id="github-member-input"
                                    value={newMember}
                                    onChange={(e) => setNewMember(e.target.value)}
                                />
                            </FormControl>
                        </Box>
                        <Button style={{ height: "100%" }} variant="contained" onClick={handleAddMember}>
                            Add
                        </Button>
                    </Stack>

                    {/* Display Current Members */}
                    <Stack spacing={1}>
                        {githubIds.map((id) => (<span key={id}>{id}</span>))}
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={"dialog"}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default EditTeamDialog;
