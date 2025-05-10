import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import DownloadIcon from '@mui/icons-material/Download';
import BugReportIcon from '@mui/icons-material/BugReport';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import UpdateIcon from '@mui/icons-material/Update';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  border: '1px solid' + colors.border,
  marginBottom: '16px',
}));

const ReleaseHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
});

const ReleaseInfo = styled(Box)({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '8px',
});

const TagChip = styled(Chip)({
  backgroundColor: colors.button,
  color: colors.text,
  '&:hover': {
    backgroundColor: colors.buttonHover,
  },
});

const ChangelogPage = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/Diabolical-Studios/DiabolicalGameLauncher/releases'
        );
        if (!response.ok) {
          throw new Error(`GitHub API Error: ${response.status}`);
        }
        const data = await response.json();
        setReleases(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const formatDate = dateString => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const parseReleaseNotes = body => {
    if (!body) return { features: [], fixes: [], updates: [] };

    const sections = {
      features: [],
      fixes: [],
      updates: [],
    };

    const lines = body.split('\r\n');
    let currentSection = null;

    lines.forEach(line => {
      if (line.toLowerCase().includes('features:')) {
        currentSection = 'features';
      } else if (line.toLowerCase().includes('fixes:')) {
        currentSection = 'fixes';
      } else if (line.toLowerCase().includes('updates:')) {
        currentSection = 'updates';
      } else if (line.trim() && currentSection) {
        sections[currentSection].push(line.trim().replace(/^[•-]\s*/, ''));
      }
    });

    return sections;
  };

  return (
    <Box
      sx={{
        padding: '24px',
        height: 'calc(100vh - 48px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: colors.background,
        },
        '&::-webkit-scrollbar-thumb': {
          background: colors.border,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: colors.button,
        },
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: colors.text }}>
        Changelog
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress sx={{ color: colors.button }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading &&
        !error &&
        releases.map(release => {
          const notes = parseReleaseNotes(release.body);
          const isPrerelease = release.prerelease;
          const isDraft = release.draft;

          return (
            <StyledPaper key={release.id} elevation={3}>
              <ReleaseHeader>
                <Box>
                  <Typography variant="h5" sx={{ color: colors.text, mb: 1 }}>
                    {release.name || release.tag_name}
                  </Typography>
                  <ReleaseInfo>
                    <TagChip size="small" label={release.tag_name} icon={<NewReleasesIcon />} />
                    {isPrerelease && (
                      <Chip
                        size="small"
                        label="Pre-release"
                        sx={{ backgroundColor: '#ff9800', color: '#000' }}
                      />
                    )}
                    {isDraft && (
                      <Chip
                        size="small"
                        label="Draft"
                        sx={{ backgroundColor: '#795548', color: '#fff' }}
                      />
                    )}
                  </ReleaseInfo>
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    Released on {formatDate(release.published_at)}
                  </Typography>
                </Box>
                <Box>
                  <Link
                    href={release.html_url}
                    onClick={e => {
                      e.preventDefault();
                      if (
                        window.electronAPI &&
                        typeof window.electronAPI.openExternal === 'function'
                      ) {
                        window.electronAPI.openExternal(release.html_url);
                      } else {
                        window.open(release.html_url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="view-on-github-link"
                    sx={{
                      color: colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    <GitHubIcon /> View on GitHub
                  </Link>
                </Box>
              </ReleaseHeader>

              <Divider sx={{ my: 2, borderColor: colors.border }} />

              <Box sx={{ color: colors.text }}>
                {notes.features.length > 0 && (
                  <Box mb={2}>
                    <Typography
                      variant="h6"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                    >
                      <NewReleasesIcon /> New Features
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {notes.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </Box>
                )}

                {notes.fixes.length > 0 && (
                  <Box mb={2}>
                    <Typography
                      variant="h6"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                    >
                      <BugReportIcon /> Bug Fixes
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {notes.fixes.map((fix, index) => (
                        <li key={index}>{fix}</li>
                      ))}
                    </ul>
                  </Box>
                )}

                {notes.updates.length > 0 && (
                  <Box mb={2}>
                    <Typography
                      variant="h6"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                    >
                      <UpdateIcon /> Updates
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {notes.updates.map((update, index) => (
                        <li key={index}>{update}</li>
                      ))}
                    </ul>
                  </Box>
                )}

                {release.assets.length > 0 && (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {release.assets.map(asset => (
                      <Link
                        key={asset.id}
                        className="download-link"
                        href={asset.browser_download_url}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: colors.text,
                          textDecoration: 'none',
                          width: 'fit-content',
                          '&:hover': {
                            color: colors.text,
                          },
                        }}
                      >
                        <DownloadIcon />
                        {asset.name} ({Math.round(asset.size / 1024 / 1024)}MB)
                      </Link>
                    ))}
                  </Box>
                )}
              </Box>
            </StyledPaper>
          );
        })}
    </Box>
  );
};

export default ChangelogPage;
