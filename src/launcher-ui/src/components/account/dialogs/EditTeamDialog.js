import React, { useEffect, useRef, useState } from "react";
import {
    Avatar,
    AvatarGroup,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    TextField,
    CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from "@mui/material/styles";
import axios from "axios";
import Cookies from "js-cookie";
import { colors } from "../../../theme/colors";
import ImageUploader from "../../common/ImageUploader";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        border: "1px solid" + colors.border,
        borderRadius: "4px",
    },
}));

const EditTeamDialog = ({ open, handleClose, team, onSave }) => {
    const [teamName, setTeamName] = useState(team.team_name);
    const [newMember, setNewMember] = useState("");
    const [githubIds, setGithubIds] = useState([...team.github_ids]);
    const [githubUsers, setGithubUsers] = useState({});
    const [uploading, setUploading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const fileInputRef = useRef();
    const [teamIconUrl, setTeamIconUrl] = useState(team.team_icon_url);

    useEffect(() => {
        const hasNameChanged = teamName !== team.team_name;
        const hasMembersChanged = JSON.stringify(githubIds) !== JSON.stringify(team.github_ids);
        setHasChanges(hasNameChanged || hasMembersChanged);
    }, [teamName, githubIds, team]);

    useEffect(() => {
        const fetchGitHubUsernames = async () => {
            const userPromises = githubIds.map(async (id) => {
                try {
                    const response = await axios.get(`https://api.diabolical.studio/rest-api/users/github/${id}`);
                    return { id, username: response.data.username };
                } catch (error) {
                    console.error(`Error fetching GitHub username for ID ${id}:`, error);
                    return { id, username: `Unknown-${id}` };
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

    const handleFileUpload = async (file) => {
        const existingKey = teamIconUrl.replace("https://diabolical.services/", "");
        setUploading(true);

        try {
            const res = await fetch(`/generate-upload-url?fileExt=${file.name.split('.').pop()}&contentType=${file.type}&overwriteKey=${existingKey}`);
            const { url } = await res.json();

            await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Upload Complete", "Your team icon was updated.");
            }

        } catch (err) {
            console.error("❌ Upload failed:", err);
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Upload Failed", "Could not upload your image.");
            }
        } finally {
            setUploading(false);
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
            team_icon_url: teamIconUrl,
            github_ids: githubIds.map(id => String(id))
        };

        console.log("📤 Sending team update request:", updatedTeam);

        try {
            const response = await fetch("/update-team", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID
                },
                body: JSON.stringify(updatedTeam)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Server Error Response:", data);
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("Edit Team Failed", "Please try again later");
                }
                throw new Error("Failed to update team.");
            }

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Team Updated", "Your team was successfully updated!");
            }

            onSave({
                ...team,
                team_name: teamName,
                team_icon_url: teamIconUrl,
                github_ids: [...githubIds]
            });

            handleClose();
        } catch (err) {
            console.error("❌ Error updating team:", err);
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Edit Team Failed", "Please try again later");
            }
        }
    };

    return (
        <StyledDialog open={open} onClose={handleClose}>
            <DialogContent className="dialog" style={{ padding: "12px", backdropFilter: "invert(1)" }}>
                <Stack spacing={2}>
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
                                borderRadius: "2px"
                            },
                            "& .MuiFormLabel-root": {
                                color: "#444444 !important",
                            }
                        }}
                    />

                    {/* Image Uploader */}
                    <ImageUploader
                        onUpload={(url) => {
                            setTeamIconUrl(url);
                            setHasChanges(true);
                        }}
                        currentImageUrl={teamIconUrl}
                        uploading={uploading}
                        setUploading={setUploading}
                    />

                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            label="GitHub ID"
                            color="secondary"
                            focused
                            fullWidth
                            placeholder="151235"
                            value={newMember}
                            onChange={(e) => setNewMember(e.target.value)}
                            sx={{
                                borderRadius: "8px",
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: colors.background,
                                    color: colors.text,
                                    border: "none",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    border: "1px solid" + colors.border + "!important",
                                    borderRadius: "2px"
                                },
                                "& .MuiFormLabel-root": {
                                    color: "#444444 !important",
                                }
                            }}
                        />
                        <IconButton
                            sx={{
                                color: "#fff !important",
                                backgroundColor: colors.button,
                                outline: "1px solid" + colors.border,
                                borderRadius: "2px"
                            }}
                            onClick={handleAddMember}
                            style={{ height: "100%" }}
                            aria-label="add"
                            color="primary"
                        >
                            <AddIcon />
                        </IconButton>
                    </Stack>

                    <Stack flexDirection="row-reverse">
                        <AvatarGroup max={4}
                                     sx={{
                                         "& .MuiAvatar-root": {
                                             width: 32,
                                             height: 32,
                                             borderColor: colors.border,
                                         },
                                         "& .MuiAvatarGroup-avatar": {
                                             backgroundColor: colors.background,
                                             color: colors.text,
                                             fontSize: "14px"
                                         }
                                     }}>
                            {githubIds.map(id => (
                                <Avatar key={id}
                                        alt={`GitHub User ${githubUsers[id] || id}`}
                                        src={`https://avatars.githubusercontent.com/u/${id}`}
                                        title={`${githubUsers[id] || "Loading..."}`} />
                            ))}
                        </AvatarGroup>
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions className="dialog" sx={{ padding: "12px" }}>
                <Button
                    sx={{
                        color: "#fff !important",
                        backgroundColor: colors.button,
                        outline: "1px solid" + colors.border,
                        borderRadius: "2px",
                        padding: "12px",
                        opacity: !hasChanges || uploading ? 0.5 : 1,
                        transition: "opacity 0.2s ease-in-out",
                        "&:hover": {
                            opacity: !hasChanges || uploading ? 0.5 : 0.8,
                            backgroundColor: colors.button
                        }
                    }}
                    onClick={handleSave}
                    style={{ width: "100%" }}
                    aria-label="save"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={uploading || !hasChanges}
                >
                    Save
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default EditTeamDialog;
