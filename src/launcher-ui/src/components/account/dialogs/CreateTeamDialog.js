import React, { useState, useRef } from "react";
import Cookies from "js-cookie";
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    Stack,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/CloudUpload";
import { colors } from "../../../theme/colors";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        border: "1px solid" + colors.border,
        borderRadius: "4px",
    },
}));

const CreateTeamDialog = ({ open, handleClose, onCreate }) => {
    const [teamName, setTeamName] = useState("");
    const [teamIconUrl, setTeamIconUrl] = useState("");
    const [githubIds, setGithubIds] = useState([]);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef();

    const handleFileUpload = async (file) => {
        try {
            setUploading(true);
            const res = await fetch(
                `/generate-upload-url?fileExt=${file.name.split(".").pop()}&contentType=${file.type}`
            );
            const { url, key } = await res.json();

            await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            setTeamIconUrl(`https://diabolical.services/${key}`);

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification(
                    "Upload Complete",
                    "Your icon has been uploaded."
                );
            }
        } catch (err) {
            console.error("❌ Upload failed:", err);
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification(
                    "Upload Failed",
                    "Could not upload your image."
                );
            }
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (teamName.trim() === "") {
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification(
                    "Team Creation Failed",
                    "Team name is Required!"
                );
            }
            return;
        }

        setError(null);

        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            setError("No session ID found. Please log in again.");
            return;
        }

        const newTeam = {
            team_name: teamName.trim(),
            team_icon_url: teamIconUrl.trim(),
            github_ids: githubIds,
        };

        console.log("📤 Sending team creation request:", newTeam);

        try {
            const response = await fetch("/create-team", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    sessionID: sessionID,
                },
                body: JSON.stringify(newTeam),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Server Error Response:", data);
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification(
                        "Team Creation Failed",
                        "Please try again later"
                    );
                }
                throw new Error("Failed to create team.");
            }

            console.log("✅ Team created successfully:", data);

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification(
                    "Team Created",
                    "Your team was successfully created!"
                );
            }

            onCreate(data);
            setTeamName("");
            setTeamIconUrl("");
            setGithubIds([]);
            handleClose();
        } catch (err) {
            console.error("❌ Error creating team:", err);
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification(
                    "Team Creation Failed",
                    "Please try again later"
                );
            }
            setError(err.message || "An error occurred while creating the team.");
        }
    };

    return (
        <StyledDialog open={open} onClose={handleClose} aria-labelledby="create-team-dialog-title">
            <DialogTitle className="dialog" id="create-team-dialog-title">
                Create a New Team
            </DialogTitle>
            <Stack className="dialog backdrop-invert">
                <Stack className={"gap-3"}>
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
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: colors.background,
                                color: colors.text,
                                border: "none",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                border: "1px solid" + colors.border + "!important",
                                borderRadius: "2px",
                            },
                            "& .MuiFormLabel-root": {
                                color: "#444444 !important",
                            },
                        }}
                    />

                    {/* Upload Icon Button */}
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                        sx={{
                            color: colors.text,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            textTransform: "none",
                            padding: "12px",
                            borderRadius: "2px",
                        }}
                    >
                        {uploading ? "Uploading..." : teamIconUrl ? "Icon Uploaded ✅" : "Upload Team Icon"}
                        <input
                            hidden
                            type="file"
                            accept=".png,.jpg,.jpeg,.gif,.webp"
                            ref={fileInputRef}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleFileUpload(file);
                            }}
                        />
                    </Button>

                    {/* Show Error Message */}
                    {error && (
                        <Typography color="error" variant="body2" style={{ marginTop: "10px" }}>
                            {error}
                        </Typography>
                    )}
                </Stack>
            </Stack>

            <DialogActions className="dialog" sx={{ padding: "12px" }}>
                <Button
                    sx={{
                        color: colors.text,
                        backgroundColor: colors.background,
                        outline: "1px solid" + colors.border,
                        borderRadius: "2px",
                        padding: "12px",
                    }}
                    onClick={handleCreate}
                    className={"size-full rounded-xs"}
                    aria-label="add"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={uploading || !teamIconUrl}
                >
                    Save
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default CreateTeamDialog;
