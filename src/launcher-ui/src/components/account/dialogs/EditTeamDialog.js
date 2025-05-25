import React, { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Cookies from 'js-cookie';
import { colors } from '../../../theme/colors';
import ImageUploader from '../../common/ImageUploader';
import ConfirmDialog from '../../common/ConfirmDialog';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    border: '1px solid' + colors.border,
    borderRadius: '4px',
  },
}));

const EditTeamDialog = ({ open, handleClose, team, onSave }) => {
  const [teamName, setTeamName] = useState(team.team_name);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [githubIds, setGithubIds] = useState([...team.github_ids]);
  const [githubUsers, setGithubUsers] = useState({});
  const [uploading, setUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [teamIconUrl, setTeamIconUrl] = useState(team.team_icon_url);
  const [activeTab, setActiveTab] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const hasNameChanged = teamName !== team.team_name;
    const hasMembersChanged = JSON.stringify(githubIds) !== JSON.stringify(team.github_ids);
    setHasChanges(hasNameChanged || hasMembersChanged);
  }, [teamName, githubIds, team]);

  useEffect(() => {
    const fetchInitialGitHubUsernames = async () => {
      const userPromises = team.github_ids.map(async id => {
        try {
          const response = await axios.get(
            `https://api.diabolical.studio/rest-api/users/github/${id}`
          );
          return { id, username: response.data.username };
        } catch (error) {
          console.error(`Error fetching GitHub username for ID ${id}:`, error);
          return { id, username: `Unknown-${id}` };
        }
      });

      const users = await Promise.all(userPromises);
      const usersMap = Object.fromEntries(users.map(user => [user.id, user.username]));
      setGithubUsers(usersMap);
    };

    fetchInitialGitHubUsernames();
  }, [team.github_ids]);

  const searchGitHubUsers = async query => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Check if the input is a numeric GitHub ID
    if (/^\d+$/.test(query)) {
      try {
        const response = await axios.get(`https://api.github.com/user/${query}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        });

        // Create a single result for the ID
        setSearchResults([
          {
            username: response.data.login,
            github_id: response.data.id,
            avatar_url: response.data.avatar_url,
            html_url: response.data.html_url,
          },
        ]);
        return;
      } catch (error) {
        console.error('Error fetching GitHub user by ID:', error);
        setSearchResults([]);
        return;
      }
    }

    // If not a numeric ID, search by username
    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=5`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const users = response.data.items.map(user => ({
        username: user.login,
        github_id: user.id,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
      }));

      setSearchResults(users);
    } catch (error) {
      console.error('Error searching GitHub users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async user => {
    // If user is a string (direct ID input), convert it to the expected format
    if (typeof user === 'string' && /^\d+$/.test(user)) {
      if (!githubIds.includes(user)) {
        try {
          const response = await axios.get(
            `https://api.diabolical.studio/rest-api/users/github/${user}?t=${Date.now()}`
          );
          setGithubUsers(prev => ({ ...prev, [user]: response.data.username }));
        } catch (error) {
          console.error(`Error fetching GitHub username for ID ${user}:`, error);
          setGithubUsers(prev => ({ ...prev, [user]: `Unknown-${user}` }));
        }
        setGithubIds([...githubIds, user]);
        setSearchQuery('');
        setSearchResults([]);
      }
      return;
    }

    // Handle object format (from search results)
    if (user && !githubIds.includes(user.github_id.toString())) {
      try {
        const response = await axios.get(
          `https://api.diabolical.studio/rest-api/users/github/${user.github_id}?t=${Date.now()}`
        );
        setGithubUsers(prev => ({ ...prev, [user.github_id]: response.data.username }));
      } catch (error) {
        console.error(`Error fetching GitHub username for ID ${user.github_id}:`, error);
        setGithubUsers(prev => ({ ...prev, [user.github_id]: `Unknown-${user.github_id}` }));
      }
      setGithubIds([...githubIds, user.github_id.toString()]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleSave = async () => {
    const sessionID = Cookies.get('sessionID');
    if (!sessionID) {
      console.error('❌ No session ID found.');
      return;
    }

    const updatedTeam = {
      session_id: sessionID,
      team_id: team.team_id,
      team_name: teamName.trim(),
      team_icon_url: teamIconUrl,
      github_ids: githubIds.map(id => String(id)),
    };

    console.log('📤 Sending team update request:', updatedTeam);

    try {
      const response = await fetch('/update-team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTeam),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Server Error Response:', data);
        if (window.electronAPI) {
          window.electronAPI.showCustomNotification('Edit Team Failed', 'Please try again later');
        }
        throw new Error('Failed to update team.');
      }

      if (window.electronAPI) {
        window.electronAPI.showCustomNotification(
          'Team Updated',
          'Your team was successfully updated!'
        );
      }

      onSave({
        ...team,
        team_name: teamName,
        team_icon_url: teamIconUrl,
        github_ids: [...githubIds],
      });

      handleClose();
    } catch (err) {
      console.error('❌ Error updating team:', err);
      if (window.electronAPI) {
        window.electronAPI.showCustomNotification('Edit Team Failed', 'Please try again later');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      const sessionID = Cookies.get('sessionID');
      if (!sessionID) {
        throw new Error('No session ID found');
      }

      const response = await fetch(`/delete-team`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: team.team_id,
          sessionId: sessionID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }

      if (window.electronAPI) {
        window.electronAPI.showCustomNotification(
          'Team Deleted',
          'The team has been successfully deleted.'
        );
      }

      // Close the dialog and refresh the game list
      setDeleteDialogOpen(false);
      window.location.reload(); // Refresh the page to update the game list
    } catch (err) {
      console.error('❌ Delete failed:', err);
      setDeleteError(err.message || 'Could not delete the team.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <StyledDialog open={open} onClose={handleClose}>
        <DialogContent className="dialog" style={{ padding: '12px', backdropFilter: 'invert(1)' }}>
          <Stack spacing={2}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  color: colors.text,
                  '&.Mui-selected': {
                    color: colors.primary,
                  },
                },
              }}
            >
              <Tab label="General" />
              <Tab label="Members" />
              <Tab label="Settings" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <Stack spacing={2}>
                  <TextField
                    label="Team Name"
                    color="secondary"
                    focused
                    fullWidth
                    placeholder="Very Cool Team Name"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    sx={{
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: colors.background,
                        color: colors.text,
                        border: 'none',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid' + colors.border + '!important',
                        borderRadius: '4px',
                      },
                      '& .MuiFormLabel-root': {
                        color: '#444444 !important',
                      },
                    }}
                  />

                  <ImageUploader
                    onUpload={url => {
                      setTeamIconUrl(url);
                      setHasChanges(true);
                    }}
                    currentImageUrl={teamIconUrl}
                    uploading={uploading}
                    setUploading={setUploading}
                    headers={{
                      sessionID: Cookies.get('sessionID'),
                      uploadUrl: 'https://cdn.diabolical.services/generateUploadUrl',
                    }}
                  />
                </Stack>
              )}

              {activeTab === 1 && (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <Autocomplete
                      freeSolo
                      fullWidth
                      options={searchResults}
                      getOptionLabel={option => {
                        if (typeof option === 'string') return option;
                        return option.username || '';
                      }}
                      loading={isSearching}
                      value={null}
                      inputValue={searchQuery}
                      onInputChange={(event, newValue) => {
                        setSearchQuery(newValue);
                        searchGitHubUsers(newValue);
                      }}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          handleAddMember(newValue);
                        }
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="Search GitHub Users"
                          color="secondary"
                          focused
                          placeholder="Search by username or enter GitHub ID..."
                          sx={{
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: colors.background,
                              color: colors.text,
                              border: 'none',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid' + colors.border + '!important',
                              borderRadius: '4px',
                            },
                            '& .MuiFormLabel-root': {
                              color: '#444444 !important',
                            },
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isSearching ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            padding: '8px 16px',
                          }}
                        >
                          <Avatar
                            src={option.avatar_url}
                            alt={option.username}
                            sx={{ width: 24, height: 24 }}
                          />
                          <Stack>
                            <Typography sx={{ color: colors.text }}>{option.username}</Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.textSecondary,
                                fontSize: '0.75rem',
                              }}
                            >
                              ID: {option.github_id}
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                      sx={{
                        '& .MuiAutocomplete-listbox': {
                          backgroundColor: colors.background,
                          border: '1px solid' + colors.border,
                        },
                        '& .MuiAutocomplete-option': {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                        },
                      }}
                    />
                    <IconButton
                      sx={{
                        color: '#fff !important',
                        backgroundColor: colors.button,
                        outline: '1px solid' + colors.border,
                        borderRadius: '4px',
                      }}
                      onClick={() => {
                        // Check if input is a numeric ID
                        if (/^\d+$/.test(searchQuery)) {
                          handleAddMember(searchQuery);
                        } else {
                          const selectedUser = searchResults.find(
                            user => user.username === searchQuery
                          );
                          if (selectedUser) {
                            handleAddMember(selectedUser);
                          }
                        }
                      }}
                      style={{ height: 'inherit' }}
                      aria-label="add"
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>

                  <AvatarGroup
                    max={4}
                    sx={{
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        borderColor: colors.border,
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          zIndex: 2,
                        },
                      },
                      '& .MuiAvatarGroup-avatar': {
                        backgroundColor: colors.background,
                        color: colors.text,
                        fontSize: '14px',
                      },
                    }}
                  >
                    {githubIds.map(id => (
                      <Avatar
                        key={id}
                        alt={`GitHub User ${githubUsers[id] || id}`}
                        src={`https://avatars.githubusercontent.com/u/${id}`}
                        title={`${githubUsers[id] || 'Loading...'}`}
                      />
                    ))}
                  </AvatarGroup>
                </Stack>
              )}

              {activeTab === 2 && (
                <Stack spacing={2}>
                  <Typography variant="h6" color="error">
                    Danger Zone
                  </Typography>
                  {deleteError && (
                    <Typography color="error" variant="body2">
                      {deleteError}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isDeleting}
                    sx={{
                      backgroundColor: colors.error,
                      '&:hover': {
                        backgroundColor: colors.errorDark,
                      },
                    }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Team'}
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions className="dialog" sx={{ padding: '12px' }}>
          <Button
            sx={{
              color: '#fff !important',
              backgroundColor: colors.button,
              outline: '1px solid' + colors.border,
              borderRadius: '4px',
              padding: '12px',
              opacity: !hasChanges || uploading ? 0.5 : 1,
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': {
                opacity: !hasChanges || uploading ? 0.5 : 0.8,
                backgroundColor: colors.button,
              },
            }}
            onClick={handleSave}
            style={{ width: '100%' }}
            aria-label="save"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={uploading || !hasChanges}
          >
            Save
          </Button>
        </DialogActions>
      </StyledDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTeam}
        title="Confirm Team Deletion"
        message="Are you sure you want to delete this team? This action cannot be undone."
        confirmText="Delete"
        isConfirming={isDeleting}
      />
    </>
  );
};

export default EditTeamDialog;
