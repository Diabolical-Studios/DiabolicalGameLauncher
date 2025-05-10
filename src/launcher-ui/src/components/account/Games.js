import React, { useEffect, useState } from 'react';
import { Chip, Stack, TextField, Zoom } from '@mui/material';
import EditGameCard from './EditGameCard';
import Divider from '../Divider';
import GameCardsSkeleton from '../skeleton/GameCardsSkeleton';
import { colors } from '../../theme/colors';
import GameInfoPanel from './GameInfoPanel';
import Cookies from 'js-cookie';

const Games = ({ teams }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChipClick = teamName => {
    setSelectedTeams(prevSelected =>
      prevSelected.includes(teamName)
        ? prevSelected.filter(name => name !== teamName)
        : [...prevSelected, teamName]
    );
  };

  const handleSearchChange = event => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSaveGameChanges = updatedGame => {
    console.log('✅ Updating Game in UI:', updatedGame);
    setGames(prevGames =>
      prevGames.map(game =>
        game.game_id === updatedGame.game_id ? { ...game, ...updatedGame } : game
      )
    );
  };

  const filterGames = () => {
    return games.filter(game => {
      const gameName = game.game_name || '';
      const matchesTeam = selectedTeams.length === 0 || selectedTeams.includes(game.team_name);
      const matchesSearch = gameName.toLowerCase().includes(searchQuery);
      return matchesTeam && matchesSearch;
    });
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const sessionId = Cookies.get('sessionID');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        console.log('🎯 Fetching all games for user');

        const response = await fetch('/get-user-games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Games fetched:', data);
        setGames(data);
      } catch (err) {
        console.error('❌ Error fetching games:', err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <GameCardsSkeleton />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <Stack className={'overflow-hidden'}>
      <Stack
        className={'dialog w-full items-center justify-between p-3 min-h-fit'}
        direction={'row'}
        style={{
          backgroundColor: colors.transparent,
        }}
      >
        <Stack direction={'row'} className={'gap-3 flex-wrap items-center w-1/2'}>
          {teams.map(team => (
            <Chip
              key={team.team_name}
              label={team.team_name}
              onClick={() => handleChipClick(team.team_name)}
              style={{
                color: colors.text,
                backgroundColor: colors.background,
                borderRadius: '4px',
                outline: '1px solid' + colors.border,
                filter: selectedTeams.includes(team.team_name) ? 'invert(1)' : 'none',
              }}
            />
          ))}
        </Stack>
        <TextField
          style={{ width: '50%' }}
          label="Search Games"
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: colors.text,
              fontSize: '16px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: '1px solid' + colors.border + '!important',
              borderRadius: '4px',
              color: colors.text,
            },
            '& .MuiFormLabel-root': {
              color: colors.text,
            },
          }}
        />
      </Stack>

      <Divider />

      {games.length === 0 ? (
        <p>You did not create any Games.</p>
      ) : (
        <Stack className={'flex p-3 overflow-auto flex-col gap-3'}>
          {filterGames().map((game, index) => (
            <Zoom key={game.game_id} in={!loading} timeout={300 + index * 100}>
              <Stack className={'gap-3'} direction={'row'}>
                <div>
                  <EditGameCard
                    game={game}
                    isInstalled={false}
                    onUpdateGame={handleSaveGameChanges}
                  />
                </div>
                <GameInfoPanel game={game} />
              </Stack>
            </Zoom>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default Games;
