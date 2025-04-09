import React, {useEffect, useState, useRef} from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    Stack,
} from "@mui/material";
import {styled} from "@mui/material/styles";
import SaveIcon from '@mui/icons-material/Save';
import GameCard from "../../GameCard";
import Cookies from "js-cookie";
import {colors} from "../../../theme/colors";
import UploadIcon from '@mui/icons-material/Upload';

const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        maxHeight: "none", maxWidth: "none", background: colors.background, boxShadow: "none", margin: 0,
    }
}));

const EditGameDialog = ({open, handleClose, game, onSave}) => {
    const [gameName, setGameName] = useState(game.game_name);
    const [gameId, setGameId] = useState(game.game_id);
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState(game.background_image_url || "");
    const [gameDescription, setGameDescription] = useState(game.description || "");
    const [gameVersion, setGameVersion] = useState(game.version || "");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        setGameName(game.game_name);
        setGameBackgroundUrl(game.background_image_url || "");
        setGameDescription(game.description || "");
        setGameVersion(game.version || "");
    }, [game]);

    const handleSave = async () => {
        setIsSaving(true);
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            return;
        }

        const updatedGame = {
            game_id: gameId,
            game_name: gameName.trim(),
            background_image_url: gameBackgroundUrl.trim(),
            description: gameDescription.trim(),
            version: gameVersion.trim(),
        };

        console.log("📤 Sending game update request:", updatedGame);

        try {
            const response = await fetch("/update-game", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID,
                },
                body: JSON.stringify(updatedGame),
            });

            if (!response.ok) {
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("Edit Game Failed", "Please try again later");
                }
                throw new Error("Failed to update game.");
            }

            console.log("✅ Game updated successfully:", updatedGame);

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Game Updated", "Your game was successfully updated!");
            }

            onSave(updatedGame);
            handleClose();
        } catch (err) {
            console.error("❌ Error updating game:", err);
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Edit Game Failed", "Please try again later");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (file) => {
        setUploading(true);

        try {
            const res = await fetch(`/generate-upload-url?fileExt=${file.name.split('.').pop()}&contentType=${file.type}`);
            const { url, key } = await res.json();

            await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            setGameBackgroundUrl(`https://diabolical.services/${key}`);
            setHasChanges(true);

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Upload Complete", "Your background image was uploaded.");
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

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    };

    return (<StyledDialog open={open} onClose={handleClose} aria-labelledby="edit-game-dialog-title">
        <DialogContent style={{padding: "24px", border: "1px solid" + colors.border}}>
            <Stack display={"flex"} flexDirection={"row"} gap={"24px"}>
                <Stack spacing={2} alignItems="center">
                    {/* Render Editable Game Card */}
                    <GameCard
                        style={{aspectRatio: "63/88", outline: "1px solid" + colors.border}}
                        game={{
                            game_name: gameName,
                            game_id: gameId,
                            background_image_url: gameBackgroundUrl,
                            description: gameDescription,
                            version: gameVersion,
                        }}
                        isEditing={true}
                        setGameName={setGameName}
                        setGameId={setGameId}
                        setGameBackgroundUrl={setGameBackgroundUrl}
                        setGameDescription={setGameDescription}
                    />
                </Stack>
                <Stack
                    style={{
                        display: "flex", flexDirection: "column", width: "-webkit-fill-available", gap: "24px"
                    }}
                >
                    {/* Drag and Drop Area */}
                    <Stack
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            height: '120px',
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            border: `2px dashed ${isDragging ? colors.button : colors.border}`,
                            backgroundColor: isDragging ? `${colors.button}20` : colors.background,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
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
                        {uploading ? (
                            <Stack alignItems="center" gap={1}>
                                <CircularProgress size={24} />
                                <span style={{ color: colors.text }}>Uploading...</span>
                            </Stack>
                        ) : gameBackgroundUrl ? (
                            <Stack alignItems="center" gap={1}>
                                <UploadIcon style={{ color: colors.button }} />
                                <span style={{ color: colors.text }}>Background Uploaded ✅</span>
                                <span style={{ color: colors.border, fontSize: "12px" }}>Click or drag to change</span>
                            </Stack>
                        ) : (
                            <Stack alignItems="center" gap={1}>
                                <UploadIcon style={{ color: colors.border }} />
                                <span style={{ color: colors.text }}>Upload</span>
                                <span style={{ color: colors.border, fontSize: "12px" }}>Supports PNG, JPG, GIF, WEBP</span>
                            </Stack>
                        )}
                    </Stack>

                    {/* Save Button */}
                    <Button
                        sx={{
                            color: "#fff !important",
                            backgroundColor: colors.button,
                            outline: "1px solid" + colors.border,
                            borderRadius: "2px",
                            padding: "12px 16px",
                            opacity: hasChanges ? 1 : 0.5,
                            "&:hover": {
                                opacity: hasChanges ? 0.8 : 0.5,
                            },
                        }}
                        onClick={handleSave}
                        aria-label="save"
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </Stack>
            </Stack>
        </DialogContent>
    </StyledDialog>);
};

export default EditGameDialog;
