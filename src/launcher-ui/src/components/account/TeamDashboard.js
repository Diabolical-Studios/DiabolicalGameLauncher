import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Stack,
  Typography,
  Avatar,
  Button,
  Divider,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors } from '../../theme/colors';
import InfiniteGameScroller from '../InfiniteGameScroller';
import InfiniteGameSkeleton from '../skeleton/InfiniteScrollerSkeleton';
import FolderIcon from '@mui/icons-material/Folder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ImageButton from '../button/ImageButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSessionVerification } from './useSessionVerification';

const TeamDashboard = ({ teams, onUpdateTeam }) => {
  const { teamName } = useParams();
  const [team, setTeam] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState(null);
  const [githubAvatars, setGithubAvatars] = useState([]);
  const [tab, setTab] = useState(0);
  const [unityPackages, setUnityPackages] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [unityTab, setUnityTab] = useState(0);
  const [cdnPackages, setCdnPackages] = useState([]);
  const [loadingCdn, setLoadingCdn] = useState(false);
  const [uploadingPackage, setUploadingPackage] = useState(null);
  const [uploadedPackages, setUploadedPackages] = useState(() => {
    const saved = localStorage.getItem(`uploadedPackages_${teamName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const { isVerifying } = useSessionVerification();

  // Update localStorage when uploadedPackages changes
  useEffect(() => {
    if (teamName) {
      localStorage.setItem(`uploadedPackages_${teamName}`, JSON.stringify(uploadedPackages));
    }
  }, [uploadedPackages, teamName]);

  useEffect(() => {
    const foundTeam = teams.find(t => String(t.team_name) === String(teamName));
    if (foundTeam) {
      setTeam(foundTeam);
    } else {
      setTeam(null);
    }
  }, [teamName, teams]);

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

  // Handler to scan for unity packages
  const handleScanUnityPackages = async () => {
    setScanning(true);
    setUnityPackages([]);
    try {
      let packages = [];
      if (window.electronAPI && window.electronAPI.getUnityPackages) {
        packages = await window.electronAPI.getUnityPackages();
      } else {
        packages = [];
      }
      setUnityPackages(packages);
    } catch (e) {
      setUnityPackages([]);
    } finally {
      setScanning(false);
    }
  };

  // Automatically scan for unity packages when Unity Packages tab is opened
  useEffect(() => {
    if (tab === 1 && unityPackages.length === 0 && !scanning) {
      handleScanUnityPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Fetch CDN packages when Download tab is opened
  useEffect(() => {
    if (tab === 1 && unityTab === 1) {
      setLoadingCdn(true);
      fetch('/api/unitypackages')
        .then(res => res.json())
        .then(data => setCdnPackages(data))
        .catch(() => setCdnPackages([]))
        .finally(() => setLoadingCdn(false));
    }
  }, [tab, unityTab]);

  // Upload handler (reuse your app's upload logic)
  const handleUpload = async pkg => {
    try {
      setUploadingPackage(pkg.path);
      // Get session ID from cookies
      const sessionID = document.cookie.match(/sessionID=([^;]+)/)?.[1];
      // Get presigned upload URL
      const res = await fetch('https://cdn.diabolical.services/generateUploadUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionID ? { sessionID } : {}),
        },
        body: JSON.stringify({
          fileExt: 'unitypackage',
          contentType: 'application/octet-stream',
          size_bytes: pkg.size,
          teamName: team.team_name,
          fileName: pkg.name.replace('.unitypackage', ''),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate upload URL');
      }
      const { url } = await res.json();
      // Read the file using the electron API
      if (window.electronAPI && window.electronAPI.readFile) {
        const fileBuffer = await window.electronAPI.readFile(pkg.path);
        // Upload the file (no progress tracking)
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = resolve;
          xhr.onerror = reject;
          xhr.open('PUT', url);
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
          xhr.send(fileBuffer);
        });
        // Add to uploaded packages list
        setUploadedPackages(prev => [...prev, pkg.path]);
        if (window.electronAPI) {
          window.electronAPI.showCustomNotification(
            'Upload Complete',
            'Your Unity package was uploaded successfully.'
          );
        }
      } else {
        throw new Error('Electron API not available');
      }
    } catch (err) {
      console.error('❌ Upload failed:', err);
      if (window.electronAPI) {
        window.electronAPI.showCustomNotification(
          'Upload Failed',
          err.message === 'Quota check failed'
            ? 'You have exceeded your storage quota. Please upgrade your plan or delete some files.'
            : err.message || 'Could not upload your Unity package.'
        );
      }
    } finally {
      setUploadingPackage(null);
    }
  };

  // Download handler (replace with your download logic)
  const handleDownload = async pkg => {
    if (window.electronAPI && window.electronAPI.downloadUnityPackage) {
      await window.electronAPI.downloadUnityPackage(pkg.url);
    } else {
      // Fallback: show notification
      alert('Download not implemented');
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Verifying session...</div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <Stack
      className="h-full w-full gap-6"
      sx={{
        color: colors.text,
        background: 'none',
        padding: '24px',
        gap: 3,
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1}>
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
            '&:hover': { background: 'rgba(24,24,27,0.9)' },
          }}
        >
          Back
        </Button>
      </Stack>

      {/* Team Info and Members Side by Side */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        {/* Team Info */}
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
        {/* Members Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'end' }}>
          <Typography
            variant="subtitle2"
            sx={{ color: colors.text, fontWeight: 500, fontSize: 15 }}
          >
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
      </Stack>

      {/* Tabs for Games and Unity Packages */}
      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}
      >
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          textColor="inherit"
          indicatorColor="primary"
          variant="standard"
          sx={{
            minHeight: 32,
            height: 32,
            mb: 0.5,
            '& .MuiTab-root': {
              minHeight: 32,
              height: 32,
              padding: '0 12px',
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.2,
              gap: 0.5,
            },
            '& .MuiTab-iconWrapper': {
              fontSize: 16,
              marginRight: 4,
            },
          }}
        >
          <Tab
            label="Team Games"
            sx={{ minHeight: 32, height: 32, padding: '0 12px', fontSize: 13 }}
          />
          <Tab
            label="Unity Packages"
            sx={{ minHeight: 32, height: 32, padding: '0 12px', fontSize: 13 }}
          />
        </Tabs>
        <Divider sx={{ borderColor: colors.border, opacity: 0.5 }} />
        {tab === 0 ? (
          loadingGames ? (
            <InfiniteGameSkeleton />
          ) : errorGames ? (
            <Typography color="error" variant="body2">
              {errorGames}
            </Typography>
          ) : (
            <Box sx={{ minHeight: 80, width: '100%' }}>
              <InfiniteGameScroller games={games} style={{ width: '100%' }} />
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
            <Tabs
              value={unityTab}
              onChange={(_, v) => setUnityTab(v)}
              textColor="inherit"
              indicatorColor="primary"
              variant="standard"
              sx={{
                minHeight: 32,
                height: 32,
                '& .MuiTab-root': {
                  minHeight: 32,
                  height: 32,
                  padding: '0 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  gap: 0.5,
                },
                '& .MuiTab-iconWrapper': {
                  fontSize: 16,
                  marginRight: 4,
                },
              }}
            >
              <Tab
                label="Upload"
                icon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                iconPosition="start"
                sx={{ minHeight: 32, height: 32, padding: '0 12px', fontSize: 13 }}
              />
              <Tab
                label="Download"
                icon={<CloudDownloadIcon sx={{ fontSize: 16 }} />}
                iconPosition="start"
                sx={{ minHeight: 32, height: 32, padding: '0 12px', fontSize: 13 }}
              />
            </Tabs>
            {unityTab === 0 && (
              <>
                {unityPackages.length === 0 && !scanning && (
                  <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
                    No Unity Packages found.
                  </Typography>
                )}
                {scanning && (
                  <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
                    Scanning for Unity Packages...
                  </Typography>
                )}
                {unityPackages.length > 0 && (
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', padding: 1 }}>
                    <Stack spacing={1}>
                      {[...unityPackages]
                        .sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
                        .map(pkg => {
                          const isUploading = uploadingPackage === pkg.path;
                          const isUploaded = uploadedPackages.includes(pkg.path);
                          return (
                            <Box
                              key={pkg.path}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                cursor: isUploading || isUploaded ? 'default' : 'pointer',
                                opacity: isUploading ? 0.7 : 1,
                                pointerEvents: isUploading || isUploaded ? 'none' : 'auto',
                                justifyContent: 'space-between',
                                transition:
                                  'outline 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
                                '&:hover': {
                                  outline: '1px solid #fff',
                                  boxShadow: '0 0 0 2px rgba(255,255,255,0.3)',
                                },
                              }}
                              onClick={() => {
                                if (!isUploading && !isUploaded) handleUpload(pkg);
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FolderIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                                <Typography variant="body2" sx={{ color: colors.text }}>
                                  {pkg.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: colors.textSecondary, ml: 1 }}
                                >
                                  {pkg.size ? `${(pkg.size / 1024 / 1024).toFixed(1)} MB` : ''}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: colors.textSecondary, ml: 1 }}
                                >
                                  {pkg.mtime ? new Date(pkg.mtime).toLocaleString() : ''}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  minWidth: 28,
                                  justifyContent: 'flex-end',
                                }}
                              >
                                {isUploading && <CircularProgress size={18} color="inherit" />}
                                {isUploaded && (
                                  <CheckCircleIcon sx={{ color: '#8bc34a', fontSize: 20 }} />
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                    </Stack>
                  </Box>
                )}
              </>
            )}
            {unityTab === 1 && (
              <>
                {loadingCdn && (
                  <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
                    Loading CDN Packages...
                  </Typography>
                )}
                {!loadingCdn && cdnPackages.length === 0 && (
                  <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
                    No CDN Unity Packages found.
                  </Typography>
                )}
                {cdnPackages.length > 0 && (
                  <Box sx={{ mt: 2, maxHeight: 320, overflowY: 'auto' }}>
                    <Stack spacing={1}>
                      {cdnPackages.map(pkg => (
                        <Box
                          key={pkg.url || pkg.name}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                          }}
                        >
                          <FolderIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                          <Typography variant="body2" sx={{ color: colors.text }}>
                            {pkg.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, ml: 1 }}>
                            {pkg.size ? `${(pkg.size / 1024 / 1024).toFixed(1)} MB` : ''}
                          </Typography>
                          <ImageButton
                            icon={CloudDownloadIcon}
                            text="Download"
                            onClick={() => handleDownload(pkg)}
                            style={{ marginLeft: 'auto', minWidth: 100 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default TeamDashboard;
