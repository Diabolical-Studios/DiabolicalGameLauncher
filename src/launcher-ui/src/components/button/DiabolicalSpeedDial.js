import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CreateTeamDialog from '../account/dialogs/CreateTeamDialog';
import CreateGameDialog from '../account/dialogs/CreateGameDialog';
import { colors } from '../../theme/colors';

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'relative',
  width: '-webkit-fill-available',
  display: 'flex',
  flexDirection: 'column-reverse',

  '& .MuiFab-primary': {
    borderRadius: '4px',
    backgroundColor: colors.background + '!important',
    outline: '1px solid' + colors.border + '!important',
    width: '-webkit-fill-available',
    color: colors.text,
  },

  '& .MuiSpeedDial-actions': {
    borderRadius: '4px',
    width: '-webkit-fill-available',
    margin: 0,
    padding: 0,
    paddingBottom: '12px !important',
    gap: '12px',
  },
}));

const StyledSpeedDialAction = styled(SpeedDialAction)(({ theme }) => ({
  borderRadius: '4px',
  width: '-webkit-fill-available',
  backgroundColor: colors.background + '!important',
  outline: '1px solid' + colors.border,
  color: colors.text,
  padding: 0,
  margin: 0,
}));

const DiabolicalSpeedDial = ({ onCreateTeam, onCreateGame, teams }) => {
  const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false);
  const [openCreateGameDialog, setOpenCreateGameDialog] = useState(false);

  const handleCreateTeam = () => {
    setOpenCreateTeamDialog(true);
  };

  const handleCreateGame = () => {
    setOpenCreateGameDialog(true);
  };

  return (
    <>
      <StyledSpeedDial
        FabProps={{ className: 'dialog' }}
        ariaLabel="SpeedDial for team actions"
        icon={<SpeedDialIcon />}
      >
        <StyledSpeedDialAction
          className="dialog"
          icon={<GroupAddIcon />}
          tooltipTitle="Create Team"
          onClick={handleCreateTeam}
        />
        <StyledSpeedDialAction
          className="dialog"
          icon={<SportsEsportsIcon />}
          tooltipTitle="Create Game"
          onClick={handleCreateGame}
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
