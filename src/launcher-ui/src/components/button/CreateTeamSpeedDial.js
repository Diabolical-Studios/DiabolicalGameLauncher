import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    SpeedDial,
    SpeedDialIcon,
    SpeedDialAction
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    width: 56,
    height: 56,
    "& .MuiFab-primary": {
        width: "100%",
        height: "100%",
        borderRadius: 2,
        backgroundColor: "#000 !important",
        outline: "1px solid #444444",
    },
}));

const CreateTeamSpeedDial = ({ onCreateTeam }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setError(null);
    };

    const handleCreateTeam = async () => {
        if (teamName.trim() === "") return;
        setLoading(true);
        setError(null);

        const sessionID = localStorage.getItem("sessionID"); // ✅ Get session ID from localStorage
        if (!sessionID) {
            setError("Session ID missing. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                "https://launcher.diabolical.studio/.netlify/functions/createTeam",
                { team_name: teamName },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "sessionID": sessionID, // ✅ Send sessionID in the request headers
                    },
                }
            );

            console.log("✅ Team created successfully:", response.data);
            onCreateTeam(response.data); // ✅ Update parent component
            setTeamName("");
            handleCloseDialog();
        } catch (err) {
            console.error("❌ Error creating team:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Failed to create team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ✅ SpeedDial Component */}
            <StyledSpeedDial ariaLabel="SpeedDial for team actions" icon={<SpeedDialIcon />}>
                <SpeedDialAction icon={<AddIcon />} tooltipTitle="Create Team" onClick={handleOpenDialog} />
            </StyledSpeedDial>

            {/* ✅ Create Team Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="create-team-dialog-title">
                <DialogTitle id="create-team-dialog-title">Create a New Team</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Team Name"
                        variant="outlined"
                        fullWidth
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        autoFocus
                        sx={{ marginTop: 2 }}
                        error={!!error}
                        helperText={error}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} startIcon={<CloseIcon />} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleCreateTeam}
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CreateTeamSpeedDial;
