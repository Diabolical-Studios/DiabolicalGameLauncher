import React from 'react';
import { Box, Stack, Typography, Avatar } from '@mui/material';
import { colors } from '../../theme/colors';

const TeamMembers = ({ githubAvatars }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'end' }}>
      <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 500, fontSize: 15 }}>
        Team Members
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        {githubAvatars.map(member => (
          <Avatar
            key={member.id}
            alt={`GitHub User ${member.id}`}
            src={member.avatar_url}
            sx={{
              width: 32,
              height: 32,
              borderColor: colors.border,
              background: colors.background,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default TeamMembers;
