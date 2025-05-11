import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stack, Typography, Avatar, AvatarGroup, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors } from '../../theme/colors';
import InfiniteGameScroller from '../InfiniteGameScroller';
import InfiniteGameSkeleton from '../skeleton/InfiniteScrollerSkeleton';

const TeamDashboard = ({ teams, onUpdateTeam }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState(null);
  const [githubAvatars, setGithubAvatars] = useState([]);

  useEffect(() => {
    const foundTeam = teams.find(t => t.team_id === teamId);
    if (foundTeam) {
      setTeam(foundTeam);
    } else {
      navigate('/account/dashboard/teams');
    }
  }, [teamId, teams, navigate]);

  useEffect(() => {
    if (!team) return;

    const fetchGames = async () => {
      try {
        const response = await fetch(
          `/get-team-games?team_name=${encodeURIComponent(team.team_name)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch games for team ${team.team_name}.`);
        }

        const data = await response.json();
        setGames(data);
      } catch (err) {
        console.error('❌ Error fetching games:', err);
        setErrorGames('No Games Found!');
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGames();
  }, [team]);

  useEffect(() => {
    if (!team?.github_ids || team.github_ids.length === 0) return;

    const avatars = team.github_ids.map(id => ({
      id,
      avatar_url: `https://avatars.githubusercontent.com/u/${id}?v=4`,
    }));

    setGithubAvatars(avatars);
  }, [team?.github_ids]);

  if (!team) return null;

  return (
    <Stack className="h-full w-full p-6 gap-6">
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/account/dashboard/teams')}
          sx={{
            color: colors.text,
            '&:hover': {
              backgroundColor: colors.background,
            },
          }}
        >
          Back to Teams
        </Button>
      </Stack>

      {/* Team Info */}
      <Stack direction="row" alignItems="center" spacing={3}>
        <Avatar
          src={`${team.team_icon_url}?t=${Date.now()}`}
          alt={team.team_name}
          variant="square"
          sx={{ width: 64, height: 64, '& img': { objectFit: 'scale-down' } }}
        />
        <Stack>
          <Typography variant="h4" sx={{ color: colors.text }}>
            {team.team_name}
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Team ID: {team.team_id}
          </Typography>
        </Stack>
      </Stack>

      {/* Team Members */}
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ color: colors.text }}>
          Team Members
        </Typography>
        <AvatarGroup
          max={4}
          sx={{
            '& .MuiAvatar-root': {
              width: 40,
              height: 40,
              borderColor: colors.border,
            },
            '& .MuiAvatarGroup-avatar': {
              backgroundColor: colors.background,
              color: colors.text,
              fontSize: '14px',
            },
          }}
        >
          {githubAvatars.map(member => (
            <Avatar key={member.id} alt={`GitHub User ${member.id}`} src={member.avatar_url} />
          ))}
        </AvatarGroup>
      </Stack>

      {/* Team Games */}
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ color: colors.text }}>
          Team Games
        </Typography>
        {loadingGames ? (
          <InfiniteGameSkeleton />
        ) : errorGames ? (
          <Typography color="error">{errorGames}</Typography>
        ) : (
          <InfiniteGameScroller games={games} />
        )}
      </Stack>
    </Stack>
  );
};

export default TeamDashboard;
