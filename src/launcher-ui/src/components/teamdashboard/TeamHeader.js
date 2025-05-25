import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stack, Typography, Avatar, Button, Box, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors } from '../../theme/colors';
import axios from 'axios';

const TeamHeader = ({ team, githubAvatars }) => {
  const [githubUsernames, setGithubUsernames] = useState({});

  useEffect(() => {
    if (!githubAvatars || githubAvatars.length === 0) return;

    // Fetch GitHub usernames from Diabolical API
    const fetchGitHubUsernames = async () => {
      const userPromises = githubAvatars.map(async member => {
        try {
          const response = await axios.get(
            `https://api.diabolical.studio/rest-api/users/github/${member.id}`
          );
          return { id: member.id, username: response.data.username };
        } catch (error) {
          console.error(`Error fetching GitHub username for ID ${member.id}:`, error);
          return { id: member.id, username: `Unknown-${member.id}` };
        }
      });

      const users = await Promise.all(userPromises);
      const usersMap = Object.fromEntries(users.map(user => [user.id, user.username]));
      setGithubUsernames(usersMap);
    };

    fetchGitHubUsernames();
  }, [githubAvatars]);

  return (
    <Stack width="100%" gap={2}>
      <Button
        component={Link}
        to="/account/dashboard/teams"
        startIcon={<ArrowBackIcon />}
        sx={{
          color: colors.text,
          background: 'rgba(24,24,27,0.7)',
          borderRadius: 2,
          px: 1.5,
          fontWeight: 500,
          fontSize: 14,
          minHeight: 32,
          boxShadow: 'none',
          textTransform: 'none',
          alignSelf: 'flex-start',
          '&:hover': { background: 'rgba(24,24,27,0.9)' },
        }}
      >
        Back
      </Button>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        margin={0}
        sx={{ width: '100%' }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src={team.team_icon_url}
            alt={team.team_name}
            variant="square"
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              border: 'none',
              boxShadow: 1,
              '& img': {
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                display: 'block',
              },
            }}
          />
          <Stack>
            <Typography
              variant="subtitle1"
              sx={{ color: colors.text, fontWeight: 600, fontSize: 18, letterSpacing: 0.2 }}
            >
              {team.team_name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: colors.textSecondary, mt: 0.5, fontSize: 13 }}
            >
              Team ID: <span style={{ color: colors.text }}>{team.team_id}</span>
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'end' }}>
          <Typography
            variant="subtitle2"
            sx={{ color: colors.text, fontWeight: 500, fontSize: 15 }}
          >
            Team Members
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {githubAvatars.map(member => (
              <Tooltip
                key={member.id}
                title={githubUsernames[member.id] || `GitHub User ${member.id}`}
                arrow
                placement="top"
              >
                <Avatar
                  alt={githubUsernames[member.id] || `GitHub User ${member.id}`}
                  src={member.avatar_url}
                  sx={{
                    width: 32,
                    height: 32,
                    borderColor: colors.border,
                    background: colors.background,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      zIndex: 2,
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export default TeamHeader;
