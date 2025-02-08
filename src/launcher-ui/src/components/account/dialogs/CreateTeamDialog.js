import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Box,
    FormControl,
    InputLabel,
    TextField,
    IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import InputBase from '@mui/material/InputBase';
import AddIcon from "@mui/icons-material/Add";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        border: "1px solid #444444",
        borderRadius: "4px",
    }
}));

const CreateTeamDialog = ({ open, handleClose, onCreate }) => {
    const [teamName, setTeamName] = useState("");
    const [teamIconUrl, setTeamIconUrl] = useState("");
    const [newMember, setNewMember] = useState("");
    const [githubIds, setGithubIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddMember = () => {
        if (newMember.trim() !== "" && !githubIds.includes(newMember)) {
            setGithubIds([...githubIds, newMember]);
            setNewMember("");
        }
    };

    const handleCreate = async () => {
        if (teamName.trim() === "") {
            setError("Team name is required.");
            return;
        }

        setLoading(true);
        setError(null);

        const sessionID = localStorage.getItem("sessionID");
        if (!sessionID) {
            setError("No session ID found. Please log in again.");
            setLoading(false);
            return;
        }

        const newTeam = {
            team_name: teamName.trim(),
            team_icon_url: teamIconUrl.trim(),
            github_ids: githubIds
        };

        console.log("📤 Sending team creation request:", newTeam);

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/createTeam", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID
                },
                body: JSON.stringify(newTeam)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Server Error Response:", data);
                throw new Error("Failed to create team.");
            }

            console.log("✅ Team created successfully:", data);
            onCreate(data);
            setTeamName("");
            setTeamIconUrl("");
            setGithubIds([]);
            handleClose();
        } catch (err) {
            console.error("❌ Error creating team:", err);
            setError(err.message || "An error occurred while creating the team.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledDialog open={open} onClose={handleClose} aria-labelledby="create-team-dialog-title">
            <DialogTitle className="dialog" id="create-team-dialog-title">Create a New Team</DialogTitle>
            <DialogContent className="dialog" style={{ padding: "12px", backdropFilter: "invert(1)" }}>
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

                </Stack>
            </DialogContent>
            <DialogActions className="dialog">
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleCreate} variant="contained" color="primary" disabled={loading}>
                    {loading ? "Creating..." : "Create Team"}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default CreateTeamDialog;
