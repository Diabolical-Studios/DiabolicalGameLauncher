import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Fade,
  Link,
  Zoom,
} from '@mui/material';
import { colors } from '../../theme/colors';
import ImageButton from '../button/ImageButton';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import { Link as RouterLink } from 'react-router-dom';

// Create a custom event for color updates
const COLOR_UPDATE_EVENT = 'backgroundAnimationColorUpdate';

const handleGitHubLogin = async (setLoading, setError) => {
  const CLIENT_ID = 'Ov23ligdn0N1TMqWtNTV';
  const redirectUri = encodeURIComponent('https://buildsmith.app/github-auth');
  const source = window.api ? 'electron' : 'web';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email&state=${source}`;

  try {
    setLoading(true);
    setError(null);

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
    setError('Failed to open GitHub login. Please try again.');
    window.open(authUrl, '_blank');
  } finally {
    setLoading(false);
  }
};

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradientColors, setGradientColors] = useState([]);
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'terms', 'privacy'
  const currentColorsRef = useRef([]);
  const targetColorsRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Listen for color updates from BackgroundAnimation
    const handleColorUpdate = event => {
      const { colors } = event.detail;
      targetColorsRef.current = colors;

      // Start interpolation if not already running
      if (!animationFrameRef.current) {
        animateColors();
      }
    };

    window.addEventListener(COLOR_UPDATE_EVENT, handleColorUpdate);

    return () => {
      window.removeEventListener(COLOR_UPDATE_EVENT, handleColorUpdate);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const animateColors = () => {
    if (!targetColorsRef.current.length) {
      animationFrameRef.current = null;
      return;
    }

    // Initialize current colors if empty
    if (!currentColorsRef.current.length) {
      currentColorsRef.current = targetColorsRef.current;
      setGradientColors(currentColorsRef.current);
    }

    // Interpolate colors
    const interpolatedColors = currentColorsRef.current.map((color, i) => {
      const targetColor = targetColorsRef.current[i] || color;
      return interpolateColor(color, targetColor, 0.1); // Smooth interpolation factor
    });

    currentColorsRef.current = interpolatedColors;
    setGradientColors(interpolatedColors);

    // Continue animation if colors are still changing
    if (colorsAreDifferent(interpolatedColors, targetColorsRef.current)) {
      animationFrameRef.current = requestAnimationFrame(animateColors);
    } else {
      animationFrameRef.current = null;
    }
  };

  const interpolateColor = (color1, color2, factor) => {
    const hsl1 = color1.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%,\s*([\d.]+)\)/);
    const hsl2 = color2.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%,\s*([\d.]+)\)/);

    if (!hsl1 || !hsl2) return color1;

    const h1 = parseInt(hsl1[1]);
    const s1 = parseInt(hsl1[2]);
    const l1 = parseInt(hsl1[3]);
    const a1 = parseFloat(hsl1[4]);

    const h2 = parseInt(hsl2[1]);
    const s2 = parseInt(hsl2[2]);
    const l2 = parseInt(hsl2[3]);
    const a2 = parseFloat(hsl2[4]);

    const h = Math.round(h1 + (h2 - h1) * factor);
    const s = Math.round(s1 + (s2 - s1) * factor);
    const l = Math.round(l1 + (l2 - l1) * factor);
    const a = a1 + (a2 - a1) * factor;

    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  };

  const colorsAreDifferent = (colors1, colors2) => {
    if (colors1.length !== colors2.length) return true;
    return colors1.some((color, i) => color !== colors2[i]);
  };

  const getGradientStyle = () => {
    if (gradientColors.length === 0) {
      return {
        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
        backgroundSize: '200% 200%',
      };
    }

    // Create a more dynamic gradient with color stops
    const gradientStops = gradientColors
      .map((color, index) => {
        const position = (index / (gradientColors.length - 1)) * 100;
        return `${color} ${position}%`;
      })
      .join(', ');

    return {
      background: `linear-gradient(45deg, ${gradientStops})`,
      backgroundSize: '200% 200%',
      transition: 'background 0.5s ease',
    };
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'terms':
        return (
          <Zoom in={true} timeout={200}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                maxWidth: '100vw',
                maxHeight: '100vh',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                borderRadius: 1,
                position: 'relative',
                zIndex: 2,
                border: 'none !important',
              }}
            >
              <TermsOfService onBack={() => setCurrentPage('login')} />
            </Box>
          </Zoom>
        );
      case 'privacy':
        return (
          <Zoom in={true} timeout={200}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                maxWidth: '100vw',
                maxHeight: '100vh',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                borderRadius: 1,
                position: 'relative',
                zIndex: 2,
                border: 'none !important',
              }}
            >
              <PrivacyPolicy onBack={() => setCurrentPage('login')} />
            </Box>
          </Zoom>
        );
      default:
        return (
          <Zoom in={true} timeout={200}>
            <Box
              sx={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    ...getGradientStyle(),
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                    mb: 0.5,
                  }}
                >
                  BuildSmith
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    opacity: 0.7,
                    fontSize: '0.9rem',
                    letterSpacing: '0.2px',
                  }}
                >
                  Game Development Platform
                </Typography>
              </Box>

              {/* Content Section */}
              <Box
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      border: '1px solid rgba(211, 47, 47, 0.2)',
                      borderRadius: '16px',
                      '& .MuiAlert-icon': {
                        color: 'error.main',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.text,
                      opacity: 0.9,
                      mb: 3,
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      letterSpacing: '0.2px',
                    }}
                  >
                    Sign in to access your game development tools and automated build pipeline
                  </Typography>

                  <Box
                    sx={{
                      position: 'relative',
                      '&:hover .github-button': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        background: 'rgba(255, 255, 255, 0.08)',
                      },
                      '&:active .github-button': {
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <button
                      onClick={() => handleGitHubLogin(setLoading, setError)}
                      disabled={loading}
                      className="github-button"
                      style={{
                        width: '100%',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '0 24px',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: colors.text,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <img
                        src="/github.png"
                        alt="GitHub"
                        style={{
                          width: '20px',
                          height: '20px',
                          filter: 'brightness(0.9)',
                        }}
                      />
                      <span>{loading ? 'Connecting...' : 'Sign in with GitHub'}</span>
                      {loading && (
                        <CircularProgress
                          size={16}
                          sx={{
                            position: 'absolute',
                            right: '16px',
                            color: colors.primary,
                          }}
                        />
                      )}
                    </button>
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    color: colors.text,
                    opacity: 0.5,
                    fontSize: '0.75rem',
                    letterSpacing: '0.2px',
                  }}
                >
                  By continuing, you agree to our{' '}
                  <Link
                    component={RouterLink}
                    to="/terms-of-service"
                    sx={{
                      color: '#FFFFFF',
                      textDecoration: 'underline',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    component={RouterLink}
                    to="/privacy-policy"
                    sx={{
                      color: '#FFFFFF',
                      textDecoration: 'underline',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Zoom>
        );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.transparent,
        overflow: 'hidden',
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 20%, ${colors.primary}10 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, ${colors.secondary}10 0%, transparent 50%)`,
          zIndex: 0,
        }}
      />
      {/* Only use Container for login card, not for terms/privacy */}
      {currentPage === 'login' ? (
        <Container
          maxWidth="xs"
          sx={{
            position: 'relative',
            zIndex: 1,
            px: { xs: 2, sm: 3 },
          }}
        >
          {renderContent()}
        </Container>
      ) : (
        renderContent()
      )}
    </Box>
  );
};

export default LoginScreen;
