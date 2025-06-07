import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors } from '../../theme/colors';
import BackgroundAnimation from '../BackgroundAnimation';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  return (
    <Stack
      className={'p-6 overflow-hidden'}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <BackgroundAnimation style={{ opacity: 0.4 }} />
      </div>
      <Stack
        className={'gap-6 p-4'}
        flexDirection={'column'}
        style={{
          gap: '24px',
          padding: '24px',
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: 0,
        }}
      >
        {/* Header with back button */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            pb: 2,
          }}
        >
          <IconButton
            onClick={handleBack}
            sx={{
              color: colors.text,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
                background: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              ml: 1,
              color: colors.text,
              fontWeight: 500,
            }}
          >
            Terms of Service
          </Typography>
        </Stack>

        {/* Scrollable content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            pr: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.15)',
              },
            },
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, color: colors.text, fontWeight: 600 }}>
            Terms of Service
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: colors.text, opacity: 0.9 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            By accessing and using BuildSmith, you agree to be bound by these Terms of Service and
            all applicable laws and regulations. If you do not agree with any of these terms, you
            are prohibited from using or accessing this site.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            2. Use License
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            Permission is granted to temporarily use BuildSmith for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a transfer of title, and
            under this license you may not:
          </Typography>
          <Box component="ul" sx={{ mb: 3, pl: 3, color: colors.text, opacity: 0.9 }}>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained in BuildSmith</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>
              Transfer the materials to another person or "mirror" the materials on any other server
            </li>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            3. User Account
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            To access certain features of BuildSmith, you may be required to create an account. You
            are responsible for maintaining the confidentiality of your account information and for
            all activities that occur under your account.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            4. Disclaimer
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            The materials on BuildSmith are provided on an 'as is' basis. BuildSmith makes no
            warranties, expressed or implied, and hereby disclaims and negates all other warranties
            including, without limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of intellectual property or other
            violation of rights.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            5. Limitations
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            In no event shall BuildSmith or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business interruption)
            arising out of the use or inability to use the materials on BuildSmith.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            6. Revisions and Errata
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            The materials appearing on BuildSmith could include technical, typographical, or
            photographic errors. BuildSmith does not warrant that any of the materials on its
            website are accurate, complete, or current.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            7. Links
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            BuildSmith has not reviewed all of the sites linked to its website and is not
            responsible for the contents of any such linked site. The inclusion of any link does not
            imply endorsement by BuildSmith of the site.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            8. Modifications
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            BuildSmith may revise these terms of service at any time without notice. By using this
            website, you are agreeing to be bound by the then current version of these terms of
            service.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            9. Governing Law
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            These terms and conditions are governed by and construed in accordance with the laws and
            you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default TermsOfService;
