import React, { useEffect, useState } from "react";
import {
    Dialog, DialogContent, Button, TextField, Stack
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveIcon from '@mui/icons-material/Save';
import GameCard from "../../GameCard"; // ✅ Import the editable card component

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        border: "1px solid #444444",
        borderRadius: "4px",
        width: "60vw",
        height: "fit-content",
    }
}));

const EditGameDialog = ({ open, handleClose, game, onSave }) => {
    const [gameName, setGameName] = useState(game.game_name);
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState(game.background_image_url || "");
    const [gameDescription, setGameDescription] = useState(game.description || "");

    useEffect(() => {
        setGameName(game.game_name);
        setGameBackgroundUrl(game.background_image_url || "");
        setGameDescription(game.description || "");
    }, [game]);

    const handleSave = async () => {
        const sessionID = localStorage.getItem("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            return;
        }

        const updatedGame = {
            game_id: game.game_id,
            game_name: gameName.trim(),
            background_image_url: gameBackgroundUrl.trim(),
            description: gameDescription.trim(),
        };

        console.log("📤 Sending game update request:", updatedGame);

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/updateGame", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID,
                },
                body: JSON.stringify(updatedGame),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Server Error Response:", data);
                throw new Error("Failed to update game.");
            }

            console.log("✅ Game updated successfully:", data);
            onSave(updatedGame);
            handleClose();
        } catch (err) {
            console.error("❌ Error updating game:", err);
        }
    };

    return (
        <StyledDialog open={open} onClose={handleClose} aria-labelledby="edit-game-dialog-title">
            <DialogContent style={{ padding: "24px", backdropFilter: "invert(1)" }}>
                <Stack display={"flex"} flexDirection={"row"} gap={"24px"}>
                    <Stack spacing={2} alignItems="center">
                        {/* Render Editable Game Card */}
                        <GameCard
                            style={{ aspectRatio: "63/88", outline: "1px solid #444444" }}
                            game={{
                                game_name: gameName,
                                background_image_url: gameBackgroundUrl,
                                description: gameDescription
                            }}
                            isEditing={true} // ✅ Enables editable mode
                            setGameName={setGameName}
                            setGameBackgroundUrl={setGameBackgroundUrl}
                            setGameDescription={setGameDescription}
                        />
                    </Stack>
                    <Stack
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "-webkit-fill-available",
                            gap: "24px"
                        }}
                    >
                        {/* ✅ Background Image URL Input Field */}
                        <Stack
                            style={{
                                height: '-webkit-fill-available',
                                alignItems: "center",
                                borderRadius: "2px",
                                display: "flex",
                                width: "-webkit-fill-available"
                            }}
                        >
                            <TextField
                                label="Background Image URL"
                                variant="outlined"
                                fullWidth
                                multiline={true}
                                value={gameBackgroundUrl}
                                onChange={(e) => setGameBackgroundUrl(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: "#fff",
                                        fontFamily: "'Consolas', sans-serif",
                                        fontSize: "16px",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "1px solid #444444 !important",
                                        borderRadius: "2px"
                                    },
                                    "& .MuiFormLabel-root": {
                                        color: "#444444 !important",
                                    },
                                }}
                            />
                        </Stack>

                        {/* Save Button */}
                        <Button
                            sx={{
                                color: "#fff !important",
                                backgroundColor: "#121212 !important",
                                outline: "1px solid #444444",
                                borderRadius: "2px",
                            }}
                            onClick={handleSave}
                            aria-label="save"
                            startIcon={<SaveIcon />}
                        >
                            Save
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </StyledDialog>
    );
};

export default EditGameDialog;
