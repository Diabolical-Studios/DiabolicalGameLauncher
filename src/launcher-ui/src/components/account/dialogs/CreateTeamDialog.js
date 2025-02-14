import React, {useState} from "react";
import Cookies from "js-cookie";
import {Button, Dialog, DialogActions, DialogTitle, Stack, TextField, Typography,} from "@mui/material";
import {styled} from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import {colors} from "../../../theme/colors";

const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        border: "1px solid" + colors.border, borderRadius: "4px",
    }
}));

const CreateTeamDialog = ({open, handleClose, onCreate}) => {
    const [teamName, setTeamName] = useState("");
    const [teamIconUrl, setTeamIconUrl] = useState("");
    const [githubIds, setGithubIds] = useState([]);
    const [error, setError] = useState(null);

    const handleCreate = async () => {
        if (teamName.trim() === "") {
            setError("Team name is required.");
            return;
        }

        setError(null);

        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            setError("No session ID found. Please log in again.");
            return;
        }

        const newTeam = {
            team_name: teamName.trim(), team_icon_url: teamIconUrl.trim(), github_ids: githubIds
        };

        console.log("📤 Sending team creation request:", newTeam);

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/createTeam", {
                method: "POST", headers: {
                    "Content-Type": "application/json", "sessionID": sessionID,
                }, body: JSON.stringify(newTeam)
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
        }
    };

    return (<StyledDialog open={open} onClose={handleClose} aria-labelledby="create-team-dialog-title">
        <DialogTitle className="dialog" id="create-team-dialog-title">Create a New Team</DialogTitle>
        <Stack className="dialog backdrop-invert">
            <Stack className={"gap-5"}>
                {/* Team Name Field */}
                <TextField
                    label="Team Name"
                    color="secondary"
                    focused
                    fullWidth
                    placeholder="Very Cool Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    sx={{
                        borderRadius: "8px", "& .MuiOutlinedInput-root": {
                            backgroundColor: colors.background, color: colors.text, border: "none",
                        }, "& .MuiOutlinedInput-notchedOutline": {
                            border: "1px solid" + colors.border + "!important", borderRadius: "2px"
                        }, "& .MuiFormLabel-root": {
                            color: "#444444 !important",
                        }
                    }}
                />

                {/* Team Icon URL Field */}
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
                            backgroundColor: colors.background, color: colors.text, border: "none",
                        }, "& .MuiOutlinedInput-notchedOutline": {
                            border: "1px solid" + colors.border + "!important", borderRadius: "2px"
                        }, "& .MuiFormLabel-root": {
                            color: "#444444 !important",
                        }
                    }}
                />

                {/* Show Error Message */}
                {error && (<Typography color="error" variant="body2" style={{marginTop: "10px"}}>
                    {error}
                </Typography>)}
            </Stack>
        </Stack>
        <DialogActions className="dialog">
            <Button sx={{
                color: colors.text,
                backgroundColor: colors.button,
                outline: "1px solid" + colors.border,
                borderRadius: "2px",
            }}
                    onClick={handleCreate}
                    className={"size-full rounded-xs"}
                    aria-label="add"
                    color="primary"
                    startIcon={<SaveIcon/>}>
                Save
            </Button>
        </DialogActions>
    </StyledDialog>);
};

export default CreateTeamDialog;
