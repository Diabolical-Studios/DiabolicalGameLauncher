import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CreateTeamDialog from "../account/dialogs/CreateTeamDialog";
import CreateGameDialog from "../account/dialogs/CreateGameDialog";

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: "relative",
    width: "-webkit-fill-available",
    display: "flex",
    flexDirection: "column-reverse",

    "& .MuiFab-primary": {
        borderRadius: 2,
        backgroundColor: "#000 !important",
        outline: "1px solid #444444",
        width: "-webkit-fill-available",
    },

    "& .MuiSpeedDial-actions": {
        borderRadius: 2,
        width: "-webkit-fill-available",
        margin: 0,
        padding: 0,
        paddingBottom: "12px !important",
        gap: "12px",
    },
}));

const StyledSpeedDialAction = styled(SpeedDialAction)(({ theme }) => ({
    borderRadius: 2,
    width: "-webkit-fill-available",
    backgroundColor: "#000 !important",
    outline: "1px solid #444444",
    color: "#fff",
    padding: 0,
    margin: 0,
}));

const DiabolicalSpeedDial = ({ onCreateTeam, onCreateGame, teams, setActiveTab }) => {
    const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false);
    const [openCreateGameDialog, setOpenCreateGameDialog] = useState(false);

    // Handle "Create Team" button click
    const handleCreateTeam = () => {
        setActiveTab("teams");  // Set the active tab to "teams"
        setOpenCreateTeamDialog(true);  // Open the "Create Team" dialog
    };

    // Handle "Create Game" button click
    const handleCreateGame = () => {
        setActiveTab("games");  // Set the active tab to "games"
        setOpenCreateGameDialog(true);  // Open the "Create Game" dialog
    };

    return (
        <>
            <StyledSpeedDial FabProps={{ className: "dialog" }} ariaLabel="SpeedDial for team actions" icon={<SpeedDialIcon />}>
                <StyledSpeedDialAction
                    className="dialog"
                    icon={<GroupAddIcon />}
                    tooltipTitle="Create Team"
                    onClick={handleCreateTeam}  // Trigger tab change and open dialog
                />
                <StyledSpeedDialAction
                    className="dialog"
                    icon={<SportsEsportsIcon />}
                    tooltipTitle="Create Game"
                    onClick={handleCreateGame}  // Trigger tab change and open dialog
                />
            </StyledSpeedDial>

            {/* Create Team Dialog */}
            <CreateTeamDialog
                open={openCreateTeamDialog}
                handleClose={() => setOpenCreateTeamDialog(false)}
                onCreate={onCreateTeam}
            />

            {/* Create Game Dialog */}
            <CreateGameDialog
                open={openCreateGameDialog}
                handleClose={() => setOpenCreateGameDialog(false)}
                onCreate={onCreateGame}
                teams={teams}
            />
        </>
    );
};

export default DiabolicalSpeedDial;
