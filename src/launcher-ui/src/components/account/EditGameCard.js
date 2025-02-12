import React, {useState} from "react";
import OnlyImageButton from "../button/OnlyImageButton";
import EditIcon from "@mui/icons-material/Edit";
import {Stack} from "@mui/material";
import EditGameDialog from "./dialogs/EditGameDialog";
import GameButton from "../button/GameButton";
import HoverMenu from "../button/HoverMenu";

const EditGameCard = ({game, onUpdateGame}) => {
    const [editOpen, setEditOpen] = useState(false);

    const handleSaveGameChanges = (updatedGame) => {
        console.log("✅ Updating Game in UI:", updatedGame);

        if (typeof onUpdateGame === "function") {
            onUpdateGame(updatedGame);
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
                       width: "auto",
                       aspectRatio: "63/88",
                   }}
                   onContextMenu={(e) => {
                       e.preventDefault();
                       window.electronAPI.showContextMenu(game.game_id, {x: e.pageX, y: e.pageY});
                   }}
    >
        <OnlyImageButton icon={EditIcon} style={{padding: "6px"}} onClick={() => setEditOpen(true)}/>


        <Stack style={{display: "flex", flexDirection: "column", gap: "12px", width: "100%"}}>
            <Stack className="game-details">
                <h3>{game.game_name.toUpperCase()}</h3>
                <p>{game.description}</p>
            </Stack>
            <Stack style={{display: "flex", flexDirection: "row", gap: "12px"}}>
                <GameButton
                    gameVersion={"placeholder button"}
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
