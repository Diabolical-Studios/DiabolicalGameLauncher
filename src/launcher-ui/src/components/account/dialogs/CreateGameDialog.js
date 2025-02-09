import React, {useState, useEffect} from "react";
import {
    Dialog, DialogContent, Button, TextField, Stack, Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import {styled} from "@mui/material/styles";
import SaveIcon from '@mui/icons-material/Save';
import GameCard from "../../GameCard"; // ✅ Import the editable card component

const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        border: "1px solid #444444", borderRadius: "4px", width: "60vw", height: "fit-content",
    }
}));

const CreateGameDialog = ({open, handleClose, onSave, teams}) => {
    const [gameName, setGameName] = useState("Default Game Name");
    const [gameId, setGameId] = useState("Default Game ID");
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState("https://png.pngtree.com/element_our/20190530/ourmid/pngtree-white-spot-float-image_1256405.jpg");
    const [gameDescription, setGameDescription] = useState("Default Game Description");
    const [gameVersion] = useState("0.0.1");
    const [selectedTeam, setSelectedTeam] = useState(""); // Store selected team

    // Set default selected team when teams are loaded
    useEffect(() => {
        if (teams && teams.length > 0) {
            setSelectedTeam(teams[0].team_id);  // Set default selected team
        }
    }, [teams]);

    const handleSave = async () => {
        const sessionID = localStorage.getItem("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            return;
        }

        if (!selectedTeam) {
            console.error("❌ No team selected.");
            return;
        }

        const newGame = {
            game_name: gameName.trim(),
            game_id: gameId.trim(),
            background_image_url: gameBackgroundUrl.trim(),
            description: gameDescription.trim(),
            version: gameVersion,
            team_name: selectedTeam,  // Include selected team
        };

        console.log("📤 Sending game creation request:", newGame);

        try {
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/createGame", {
                method: "POST", headers: {
                    "Content-Type": "application/json", "sessionID": sessionID,
                }, body: JSON.stringify(newGame),
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

    return (<StyledDialog open={open} onClose={handleClose} aria-labelledby="create-game-dialog-title">
        <DialogContent style={{padding: "24px", backdropFilter: "invert(1)"}}>
            <Stack display={"flex"} flexDirection={"row"} gap={"24px"}>
                <Stack spacing={2} alignItems="center">
                    {/* Render Editable Game Card */}
                    <GameCard
                        style={{aspectRatio: "63/88", outline: "1px solid #444444"}}
                        game={{
                            game_name: gameName,
                            game_id: gameId,
                            background_image_url: gameBackgroundUrl,
                            description: gameDescription,
                            version: gameVersion,
                        }}
                        isEditing={true} // ✅ Enables editable mode
                        setGameName={setGameName}
                        setGameId={setGameId}
                        setGameBackgroundUrl={setGameBackgroundUrl}
                        setGameDescription={setGameDescription}
                    />
                </Stack>
                <Stack
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "-webkit-fill-available",
                        gap: "24px",
                        justifyContent: "space-between",
                    }}
                >
                    <Stack style={{display: "flex", flexDirection: "column", gap: "24px"}}>

                        <TextField
                            label="Game ID"
                            variant="outlined"
                            fullWidth
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "#fff", fontFamily: "'Consolas', sans-serif", fontSize: "16px",
                                }, "& .MuiOutlinedInput-notchedOutline": {
                                    border: "1px solid #444444 !important", borderRadius: "2px"
                                }, "& .MuiFormLabel-root": {
                                    color: "#444444 !important",
                                },
                            }}
                        />

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
                                    color: "#fff", fontFamily: "'Consolas', sans-serif", fontSize: "16px",
                                }, "& .MuiOutlinedInput-notchedOutline": {
                                    border: "1px solid #444444 !important", borderRadius: "2px"
                                }, "& .MuiFormLabel-root": {
                                    color: "#444444 !important",
                                },
                            }}
                        />

                        {/* Team Selection Dropdown */}
                        <FormControl fullWidth sx={{
                            "& .MuiSelect-select": {
                                border: "1px solid #444444 !important", borderRadius: "2px", color: "#fff",
                            },
                        }}>
                            <InputLabel id="team-select-label"
                                        style={{backgroundColor: "#000", color: "#444444", padding: "0 8px"}}>Select
                                Team</InputLabel>
                            <Select
                                labelId="team-select-label"
                                value={selectedTeam}
                                label="Select Team"
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                variant={"filled"}
                            >
                                {teams.map((team) => (<MenuItem
                                    style={{backgroundColor: "#000", color: "#444444", padding: "0 !important"}}
                                    key={team.team_name}
                                    value={team.team_name}>
                                    {team.team_name}
                                </MenuItem>))}
                            </Select>
                        </FormControl>
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
                        startIcon={<SaveIcon/>}
                    >
                        Save
                    </Button>
                </Stack>
            </Stack>
        </DialogContent>
    </StyledDialog>);
};

export default CreateGameDialog;
