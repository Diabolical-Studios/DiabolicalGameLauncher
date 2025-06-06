import React from 'react';
import { Box, Container, Typography, Chip } from '@mui/material';
import { colors } from '../../theme/colors';
import ImageButton from '../button/ImageButton';

const handleGitHubLogin = async () => {
  const CLIENT_ID = 'Ov23ligdn0N1TMqWtNTV';
  const redirectUri = encodeURIComponent('https://buildsmith.app/github-auth');
  const source = window.api ? 'electron' : 'web';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email&state=${source}`;

  try {
    if (window.electronAPI) {
      const success = await window.electronAPI.openExternal(authUrl);
      if (!success) {
        window.open(authUrl, '_blank');
      }
    } else {
      window.location.href = authUrl;
    }
  } catch (error) {
    console.error('Error opening GitHub login:', error);
    window.open(authUrl, '_blank');
  }
};

const LoginScreen = () => {
  const features = [
    { icon: '⚡', label: 'Automated Builds', description: 'One-click deployment' },
    { icon: '🚀', label: 'Instant Updates', description: 'Seamless distribution' },
    { icon: '📦', label: 'Smart Packaging', description: 'Optimized delivery' },
    { icon: '🔄', label: 'Auto Versioning', description: 'Never miss a build' },
    { icon: '🔒', label: 'Secure', description: 'Enterprise-grade security' },
    { icon: '📊', label: 'Analytics', description: 'Track your builds' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: colors.text,
              fontWeight: 600,
              fontSize: { xs: '1.75rem', md: '2rem' },
              textAlign: 'center',
              mb: 2,
            }}
          >
            Welcome to BuildSmith
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: colors.text,
              opacity: 0.9,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.6,
              maxWidth: '600px',
              '& .highlight': {
                color: colors.primary,
                fontWeight: 600,
              },
            }}
          >
            <span className="highlight">One-click</span> deployments,{' '}
            <span className="highlight">instant</span> updates, and{' '}
            <span className="highlight">seamless</span> distribution. Focus on creating games, not
            managing builds.
          </Typography>

          <ImageButton
            onClick={handleGitHubLogin}
            image="/github.png"
            text="Connect GitHub to Start Automating"
            style={{
              marginTop: '1rem',
              minWidth: '300px',
              fontSize: '1rem',
            }}
          />

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center',
              maxWidth: '600px',
              mt: 4,
            }}
          >
            {features.map((feature, index) => (
              <Chip
                key={index}
                icon={<span style={{ fontSize: '1rem' }}>{feature.icon}</span>}
                label={feature.label}
                sx={{
                  height: '28px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  transition: 'all 0.2s ease',
                  '& .MuiChip-icon': {
                    marginLeft: '6px',
                    marginRight: '-4px',
                  },
                  '& .MuiChip-label': {
                    fontSize: '0.8rem',
                    padding: '0 8px',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginScreen;
