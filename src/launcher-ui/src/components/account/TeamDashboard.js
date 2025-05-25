import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TeamDashboard = ({ teams, onUpdateTeam }) => {
  const { teamName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeam] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState(null);
  const [githubAvatars, setGithubAvatars] = useState([]);
  const [unityPackages, setUnityPackages] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [cdnPackages, setCdnPackages] = useState([]);
  const [loadingCdn, setLoadingCdn] = useState(false);
  const [uploadingPackages, setUploadingPackages] = useState(new Set());
  const [uploadedPackages, setUploadedPackages] = useState(() => {
    const saved = localStorage.getItem(`uploadedPackages_${teamName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [downloadingPackages, setDownloadingPackages] = useState(new Set());

  // Get current tab from URL
  const getCurrentTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const unityTab = searchParams.get('unityTab');
    return {
      mainTab: tab === 'packages' ? 1 : 0,
      unityTab: unityTab === 'download' ? 1 : 0,
    };
  };

  const { mainTab, unityTab } = getCurrentTab();

  // Update URL when tabs change
  const handleTabChange = (_, newValue) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', newValue === 1 ? 'packages' : 'games');
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleUnityTabChange = (_, newValue) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('unityTab', newValue === 1 ? 'download' : 'upload');
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  // Function to fetch CDN packages
  const fetchCdnPackages = useCallback(async () => {
    if (!team?.team_id) return;

    setLoadingCdn(true);
    const sessionID = document.cookie.match(/sessionID=([^;]+)/)?.[1];

    if (!sessionID) {
      console.error('Missing sessionID');
      setLoadingCdn(false);
      return;
    }

    try {
      const res = await fetch('/get-all-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: team.team_id,
          session_id: sessionID,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch packages: ${errorText}`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.packages)) {
        setCdnPackages(data.packages);
      } else if (Array.isArray(data)) {
        setCdnPackages(data);
      } else {
        console.error('Received invalid data format:', data);
        setCdnPackages([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setCdnPackages([]);
    } finally {
      setLoadingCdn(false);
    }
  }, [team?.team_id]);

  // Fetch CDN packages when team is loaded
  useEffect(() => {
    fetchCdnPackages();
  }, [fetchCdnPackages]);

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
    if (mainTab === 1 && unityPackages.length === 0 && !scanning) {
      handleScanUnityPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab]);

  // Upload handler
  const handleUpload = async pkg => {
    try {
      setUploadingPackages(prev => new Set([...prev, pkg.path]));
      // Get session ID from cookies
      const sessionID = document.cookie.match(/sessionID=([^;]+)/)?.[1];

      // First try to add the package entry
      const package_id = pkg.name.replace('.unitypackage', '');
      const addPackageRes = await fetch('/add-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id,
          team_id: team.team_id,
          session_id: sessionID,
        }),
      });

      if (!addPackageRes.ok) {
        throw new Error('Failed to register package');
      }

      // If package registration succeeded, proceed with upload
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
          fileName: package_id,
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
        // Upload the file
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
        // Refresh CDN packages list after successful upload
        await fetchCdnPackages();
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
      setUploadingPackages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pkg.path);
        return newSet;
      });
    }
  };

  // Download handler
  const handleDownload = async pkg => {
    try {
      // Check if Unity Editor is running BEFORE starting the download
      const { isRunning: isUnityRunning } = await window.electronAPI.isUnityEditorRunning();
      if (!isUnityRunning) {
        if (window.electronAPI.showCustomNotification) {
          window.electronAPI.showCustomNotification(
            'Unity Editor Not Running',
            'Please open a Unity project in the Unity Editor before installing the package.'
          );
        }
        return; // DO NOT download
      }

      setDownloadingPackages(prev => new Set([...prev, pkg.id || pkg.package_id]));
      const url = pkg.package_url;
      if (!url) throw new Error('No package_url found for this package.');

      // Download the package
      const success = await window.electronAPI.downloadUnityPackage(
        url,
        `${pkg.package_id || 'UnityPackage'}`
      );

      if (success) {
        const packagePath = await window.electronAPI.getLastDownloadedPath();
        if (packagePath) {
          await window.electronAPI.installUnityPackage(packagePath);
          // Delete the package after installation
          await window.electronAPI.deleteFile(packagePath);
          if (window.electronAPI.showCustomNotification) {
            window.electronAPI.showCustomNotification(
              'Package Imported',
              'The Unity package was opened. Please complete the import in your Unity Editor.'
            );
          }
        }
      }
    } catch (err) {
      if (window.electronAPI && window.electronAPI.showCustomNotification) {
        window.electronAPI.showCustomNotification(
          'Download Failed',
          err.message || 'Could not download your Unity package.'
        );
      }
    } finally {
      setDownloadingPackages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pkg.id || pkg.package_id);
        return newSet;
      });
    }
  };

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
          value={mainTab}
          onChange={handleTabChange}
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
        {mainTab === 0 ? (
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
              onChange={handleUnityTabChange}
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
                icon={<UploadRoundedIcon sx={{ fontSize: 16 }} />}
                iconPosition="start"
                sx={{ minHeight: 32, height: 32, padding: '0 12px', fontSize: 13 }}
              />
              <Tab
                label="Download"
                icon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
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
                          const isUploading = uploadingPackages.has(pkg.path);
                          const isUploaded = uploadedPackages.includes(pkg.path);
                          const packageId = pkg.name.replace('.unitypackage', '');
                          const existsInCdn = cdnPackages.some(
                            cdnPkg => cdnPkg.package_id === packageId
                          );
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
                                  {packageId}
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
                                {(isUploaded || existsInCdn) && (
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
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', padding: 1 }}>
                    <Stack spacing={1}>
                      {[1, 2, 3].map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FolderIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                            <Box
                              sx={{
                                width: 200,
                                height: 20,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 1,
                              }}
                            />
                            <Box
                              sx={{
                                width: 150,
                                height: 16,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              minWidth: 28,
                              justifyContent: 'flex-end',
                            }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
                {!loadingCdn && cdnPackages.length === 0 && (
                  <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
                    No CDN Unity Packages found.
                  </Typography>
                )}
                {!loadingCdn && cdnPackages.length > 0 && (
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', padding: 1 }}>
                    <Stack spacing={1}>
                      {cdnPackages.map(pkg => {
                        const isDownloading = downloadingPackages.has(pkg.id || pkg.package_id);
                        return (
                          <Box
                            key={pkg.id || pkg.package_id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              background: 'rgba(255,255,255,0.02)',
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              cursor: isDownloading ? 'default' : 'pointer',
                              opacity: isDownloading ? 0.7 : 1,
                              pointerEvents: isDownloading ? 'none' : 'auto',
                              justifyContent: 'space-between',
                              transition:
                                'outline 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
                              '&:hover': {
                                outline: '1px solid #fff',
                                boxShadow: '0 0 0 2px rgba(255,255,255,0.3)',
                              },
                            }}
                            onClick={() => {
                              if (!isDownloading) handleDownload(pkg);
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <FolderIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                              <Typography variant="body2" sx={{ color: colors.text }}>
                                {pkg.package_id}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: colors.textSecondary, ml: 1 }}
                              >
                                {new Date(pkg.created_at).toLocaleString()}
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
                              {isDownloading ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <DownloadRoundedIcon
                                  sx={{ color: colors.textSecondary, fontSize: 20 }}
                                />
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
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default TeamDashboard;
