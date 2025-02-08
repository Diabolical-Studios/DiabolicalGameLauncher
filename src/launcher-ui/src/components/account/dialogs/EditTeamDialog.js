import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Stack,
    Box,
    FormControl, InputLabel
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {AccountCircle} from "@mui/icons-material";
import InputBase from '@mui/material/InputBase';


// ✅ Styled Dialog Paper Component
const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        border: "1px solid #444444", // ✅ Adds the outline
        borderRadius: "4px",
    }
}));

// ✅ Bootstrap Styled Input
const BootstrapInput = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        borderRadius: 4,
        position: 'relative',
        backgroundColor: '#F3F6F9',
        border: '1px solid',
        borderColor: '#E0E3E7',
        fontSize: 16,
        width: '100%',
        padding: '10px 12px',
        transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            boxShadow: `0 0 0 0.2rem ${theme.palette.primary.light}`,
            borderColor: theme.palette.primary.main,
        },
    },
}));


const EditTeamDialog = ({ open, handleClose, team, onSave }) => {
    const [teamName, setTeamName] = useState(team.team_name);
    const [newMember, setNewMember] = useState("");
    const [githubIds, setGithubIds] = useState([...team.github_ids]);

    const handleAddMember = () => {
        if (newMember.trim() !== "" && !githubIds.includes(newMember)) {
            setGithubIds([...githubIds, newMember]);
            setNewMember("");
        }
    };

    const handleSave = () => {
        onSave({
            ...team,
            team_name: teamName,
            github_ids: githubIds,
        });
        handleClose();
    };

    return (
        <StyledDialog open={open} onClose={handleClose} aria-labelledby="edit-team-dialog-title">
            <DialogTitle className={"dialog"} id="edit-team-dialog-title">Edit Team: {team.team_name}</DialogTitle>
            <DialogContent className={"dialog"} style={{padding: "12px", backdropFilter: "invert(1)"}}>
                <Stack spacing={2}>
                    {/* Edit Team Name - Bootstrap Styled Input */}
                    <FormControl variant="standard">
                        <InputLabel shrink htmlFor="team-name-input">Team Name</InputLabel>
                        <BootstrapInput
                            id="team-name-input"
                            defaultValue={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                    </FormControl>

                    {/* Add GitHub Member - Bootstrap Styled Input with Icon */}
                    <Stack direction="row" spacing={"12px"} alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                <InputLabel shrink htmlFor="github-member-input">GitHub ID</InputLabel>
                                <BootstrapInput
                                    id="github-member-input"
                                    value={newMember}
                                    onChange={(e) => setNewMember(e.target.value)}
                                />
                            </FormControl>
                        </Box>
                        <Button style={{height: "100%"}} variant="contained" onClick={handleAddMember}>
                            Add
                        </Button>
                    </Stack>

                    {/* Display Current Members */}
                    <Stack spacing={1}>
                        {githubIds.map((id) => (
                            <span key={id}>{id}</span>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={"dialog"}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default EditTeamDialog;
