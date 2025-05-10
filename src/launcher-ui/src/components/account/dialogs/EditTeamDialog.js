import React, {useEffect, useState} from "react";
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import {styled} from "@mui/material/styles";
import axios from "axios";
import Cookies from "js-cookie";
import {colors} from "../../../theme/colors";
import ImageUploader from "../../common/ImageUploader";
import ConfirmDialog from "../../common/ConfirmDialog";

const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        border: "1px solid" + colors.border,
        borderRadius: "4px",
    },
}));

const EditTeamDialog = ({open, handleClose, team, onSave}) => {
    const [teamName, setTeamName] = useState(team.team_name);
    const [newMember, setNewMember] = useState("");
    const [githubIds, setGithubIds] = useState([...team.github_ids]);
    const [githubUsers, setGithubUsers] = useState({});
    const [uploading, setUploading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [teamIconUrl, setTeamIconUrl] = useState(team.team_icon_url);
    const [activeTab, setActiveTab] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);


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
            session_id: sessionID,
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
                    "Content-Type": "application/json"
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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleDeleteTeam = async () => {
        setIsDeleting(true);
        setDeleteError("");

        try {
            const sessionID = Cookies.get("sessionID");
            if (!sessionID) {
                throw new Error("No session ID found");
            }

            const response = await fetch(`/delete-team`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    teamId: team.team_id,
                    sessionId: sessionID
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete team");
            }

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Team Deleted", "The team has been successfully deleted.");
            }

            // Close the dialog and refresh the game list
            setDeleteDialogOpen(false);
            window.location.reload(); // Refresh the page to update the game list
        } catch (err) {
            console.error("❌ Delete failed:", err);
            setDeleteError(err.message || "Could not delete the team.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <StyledDialog open={open} onClose={handleClose}>
                <DialogContent className="dialog" style={{padding: "12px", backdropFilter: "invert(1)"}}>
                    <Stack spacing={2}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': {
                                    color: colors.text,
                                    '&.Mui-selected': {
                                        color: colors.primary
                                    }
                                }
                            }}
                        >
                            <Tab label="General"/>
                            <Tab label="Members"/>
                            <Tab label="Settings"/>
                        </Tabs>

                        <Box sx={{mt: 2}}>
                            {activeTab === 0 && (
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
                                                borderRadius: "4px"
                                            },
                                            "& .MuiFormLabel-root": {
                                                color: "#444444 !important",
                                            }
                                        }}
                                    />

                                    <ImageUploader
                                        onUpload={(url) => {
                                            setTeamIconUrl(url);
                                            setHasChanges(true);
                                        }}
                                        currentImageUrl={teamIconUrl}
                                        uploading={uploading}
                                        setUploading={setUploading}
                                    />
                                </Stack>
                            )}

                            {activeTab === 1 && (
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1}>
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
                                                    borderRadius: "4px"
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
                                                borderRadius: "4px"
                                            }}
                                            onClick={handleAddMember}
                                            style={{height: "inherit"}}
                                            aria-label="add"
                                            color="primary"
                                        >
                                            <AddIcon/>
                                        </IconButton>
                                    </Stack>

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
                                                    title={`${githubUsers[id] || "Loading..."}`}/>
                                        ))}
                                    </AvatarGroup>
                                </Stack>
                            )}

                            {activeTab === 2 && (
                                <Stack spacing={2}>
                                    <Typography variant="h6" color="error">Danger Zone</Typography>
                                    {deleteError && (
                                        <Typography color="error" variant="body2">
                                            {deleteError}
                                        </Typography>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon/>}
                                        onClick={() => setDeleteDialogOpen(true)}
                                        disabled={isDeleting}
                                        sx={{
                                            backgroundColor: colors.error,
                                            "&:hover": {
                                                backgroundColor: colors.errorDark
                                            }
                                        }}
                                    >
                                        {isDeleting ? "Deleting..." : "Delete Team"}
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions className="dialog" sx={{padding: "12px"}}>
                    <Button
                        sx={{
                            color: "#fff !important",
                            backgroundColor: colors.button,
                            outline: "1px solid" + colors.border,
                            borderRadius: "4px",
                            padding: "12px",
                            opacity: !hasChanges || uploading ? 0.5 : 1,
                            transition: "opacity 0.2s ease-in-out",
                            "&:hover": {
                                opacity: !hasChanges || uploading ? 0.5 : 0.8,
                                backgroundColor: colors.button
                            }
                        }}
                        onClick={handleSave}
                        style={{width: "100%"}}
                        aria-label="save"
                        color="primary"
                        startIcon={<SaveIcon/>}
                        disabled={uploading || !hasChanges}
                    >
                        Save
                    </Button>
                </DialogActions>
            </StyledDialog>

            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteTeam}
                title="Confirm Team Deletion"
                message="Are you sure you want to delete this team? This action cannot be undone."
                confirmText="Delete"
                isConfirming={isDeleting}
            />
        </>
    );
};

export default EditTeamDialog;
