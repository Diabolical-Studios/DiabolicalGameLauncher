import React, { useState } from "react";
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

const CreateGameDialog = ({ open, handleClose, onSave }) => {
    const [gameName, setGameName] = useState("");
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState("");
    const [gameDescription, setGameDescription] = useState("");
    const [gameVersion] = useState("");

    const handleSave = async () => {
        const sessionID = localStorage.getItem("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            return;
        }

        const newGame = {
            game_name: gameName.trim(),
            background_image_url: gameBackgroundUrl.trim(),
            description: gameDescription.trim(),
            version: gameVersion,
        };

        console.log("📤 Sending game creation request:", newGame);

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/uploadGame", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID,
                },
                body: JSON.stringify(newGame),
            });

            if (!response.ok) {
                throw new Error("Failed to create game.");
            }

            console.log("✅ Game created successfully:", newGame);

            // 🔹 Call `onSave` to update the parent component with new game
            onSave(newGame);

            handleClose(); // Close the dialog
        } catch (err) {
            console.error("❌ Error creating game:", err);
        }
    };

    return (
        <StyledDialog open={open} onClose={handleClose} aria-labelledby="create-game-dialog-title">
            <DialogContent style={{ padding: "24px", backdropFilter: "invert(1)" }}>
                <Stack display={"flex"} flexDirection={"row"} gap={"24px"}>
                    <Stack spacing={2} alignItems="center">
                        {/* Render Editable Game Card */}
                        <GameCard
                            style={{ aspectRatio: "63/88", outline: "1px solid #444444" }}
                            game={{
                                game_name: gameName,
                                background_image_url: gameBackgroundUrl,
                                description: gameDescription,
                                version: gameVersion,
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
                        {/* Background Image URL Input Field */}
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

export default CreateGameDialog;
