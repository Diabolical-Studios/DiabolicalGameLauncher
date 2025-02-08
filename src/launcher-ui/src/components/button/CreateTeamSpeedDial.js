import React, {useState} from 'react';
import {styled} from '@mui/material/styles';
import {
    Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, SpeedDial, SpeedDialIcon, SpeedDialAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const StyledSpeedDial = styled(SpeedDial)(({theme}) => ({
    position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2), width: 56, // Set fixed width
    height: 56, // Set fixed height
    '& .MuiFab-primary': {
        width: '100%', // Ensure child elements take full width
        height: '100%', // Ensure child elements take full height
        borderRadius: 2, // Override default round styling
        backgroundColor: '#000 !important', outline: '1px solid #444444',
    }
}));

const CreateTeamSpeedDial = ({onCreateTeam}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [teamName, setTeamName] = useState("");

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleCreateTeam = () => {
        if (teamName.trim() === "") return;
        onCreateTeam(teamName);
        setTeamName("");
        handleCloseDialog();
    };

    return (<>
        {/* ✅ SpeedDial Component */}
        <StyledSpeedDial
            ariaLabel="SpeedDial for team actions"
            icon={<SpeedDialIcon/>}
        >
            <SpeedDialAction
                icon={<AddIcon/>}
                tooltipTitle="Create Team"
                onClick={handleOpenDialog}
            />
        </StyledSpeedDial>

        {/* ✅ Create Team Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="create-team-dialog-title">
            <DialogTitle id="create-team-dialog-title">Create a New Team</DialogTitle>
            <DialogContent>
                <TextField
                    label="Team Name"
                    variant="outlined"
                    fullWidth
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    autoFocus
                    sx={{marginTop: 2}}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog} startIcon={<CloseIcon/>}>Cancel</Button>
                <Button onClick={handleCreateTeam} variant="contained" color="primary" startIcon={<SaveIcon/>}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    </>);
};

export default CreateTeamSpeedDial;
