import React, {useState} from "react";
import OnlyImageButton from "../button/OnlyImageButton";
import EditIcon from "@mui/icons-material/Edit";
import {Stack} from "@mui/material";
import EditGameDialog from "./dialogs/EditGameDialog";
import GameButton from "../button/GameButton";

const EditGameCard = ({game, isInstalled, onUpdateGame, deploymentStatus}) => {
    const [editOpen, setEditOpen] = useState(false);

    const handleSaveGameChanges = (updatedGame) => {
        console.log("✅ Updating Game in UI:", updatedGame);

        if (typeof onUpdateGame === "function") {
            onUpdateGame(updatedGame);
        }
    };

    const getDeploymentStatusColor = () => {
        switch (deploymentStatus?.status) {
            case 'success':
                return '#4caf50';
            case 'pending':
                return '#ff9800';
            case 'error':
                return '#f44336';
            case 'not_deployed':
                return '#9e9e9e';
            default:
                return '#9e9e9e';
        }
    };

    return (<Stack className={"game-banner flex flex-col justify-between items-end p-3 w-auto aspect-63/88"}
                   style={{
                       backgroundImage: `url('${game.background_image_url}')`,
                   }}
                   onContextMenu={(e) => {
                       e.preventDefault();
                       window.electronAPI.showContextMenu(game.game_id, {x: e.pageX, y: e.pageY});
                   }}
    >
        <OnlyImageButton icon={EditIcon} style={{padding: "6px"}} onClick={() => setEditOpen(true)}/>


        <Stack className={"flex flex-col gap-3 w-full"}>
            <Stack className="game-details">
                <h3>{game.game_name.toUpperCase()}</h3>
                <p>{game.description}</p>
            </Stack>
            <Stack className={"flex gap-3"}>
                <GameButton
                    gameVersion={"placeholder button"}
                />

                {/* <HoverMenu
                    actions={[{
                        label: "Uninstall", icon: "MenuIcons/Trash.png", onClick: () => console.log("Uninstall clicked")
                    },]}
                />*/}
            </Stack>
            {deploymentStatus && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getDeploymentStatusColor()
                    }} />
                    <span style={{color: '#fff', fontSize: '12px'}}>
                        {deploymentStatus.message}
                    </span>
                </div>
            )}
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
