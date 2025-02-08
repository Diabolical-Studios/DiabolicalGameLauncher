import React, {useEffect, useState} from "react";
import HoverMenu from "../button/HoverMenu";
import GameButton from "../button/GameButton";
import OnlyImageButton from "../button/OnlyImageButton";
import EditIcon from "@mui/icons-material/Edit";
import {Stack} from "@mui/material";
import EditTeamDialog from "./dialogs/EditTeamDialog";
import EditGameDialog from "./dialogs/EditGameDialog";

const EditGameCard = ({game, isInstalled, onUpdateGame}) => {
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [gameInstalled, setGameInstalled] = useState(isInstalled);
    const [editOpen, setEditOpen] = useState(false); // ✅ Control dialog state

    useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (progressData.gameId === game.game_id) {
                setDownloadProgress(`${Math.round(progressData.percentage * 100)}%`);
            }
        };

        const handleDownloadComplete = ({gameId}) => {
            if (gameId === game.game_id) {
                setGameInstalled(true);
                setDownloadProgress(null);
            }
        };

        window.electronAPI.onDownloadProgress(handleDownloadProgress);
        window.electronAPI.onDownloadComplete(handleDownloadComplete);
    }, [game.game_id]);

    const handleButtonClick = () => {
        if (gameInstalled) {
            window.electronAPI.openGame(game.game_id);
        } else {
            window.electronAPI.downloadGame(game.game_id);
        }
    };

    const handleSaveGameChanges = (updatedGame) => {
        console.log("✅ Updating Team in UI:", updatedGame);

        if (typeof onUpdateGame === "function") {
            onUpdateGame(updatedGame); // ✅ Call parent function to update the teams list
        }
    };

    return (<Stack className={"game-banner"}
        style={{
            backgroundImage: `url('${game.background_image_url}')`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "12px",
            
            aspectRatio: "63/88",
        }}
        onContextMenu={(e) => {
            e.preventDefault();
            window.electronAPI.showContextMenu(game.game_id, {x: e.pageX, y: e.pageY});
        }}
    >

        <OnlyImageButton icon={EditIcon} onClick={() => setEditOpen(true)}/>

        <Stack style={{display: "flex", flexDirection: "column", gap: "12px", width: "100%"}}>
            <Stack className="game-details">
                <h3>{game.game_name.toUpperCase()}</h3>
                <p>{game.description}</p>
            </Stack>
            <Stack style={{display: "flex", flexDirection: "row", gap: "12px"}}>
                <GameButton
                    gameInstalled={gameInstalled}
                    downloadProgress={downloadProgress}
                    gameVersion={game.version}
                    onClick={handleButtonClick}
                />

                <HoverMenu
                    actions={[{
                        label: "Uninstall", icon: "MenuIcons/Trash.png", onClick: () => console.log("Uninstall clicked")
                    },]}
                />
            </Stack>
        </Stack>
        
        <EditGameDialog
            open={editOpen}
            handleClose={() => setEditOpen(false)}
            game={game}
            onSave={handleSaveGameChanges}
        />

    </Stack>);
};

export default EditGameCard;
