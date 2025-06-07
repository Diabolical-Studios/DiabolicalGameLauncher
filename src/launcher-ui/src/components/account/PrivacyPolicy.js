import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors } from '../../theme/colors';
import BackgroundAnimation from '../BackgroundAnimation';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            Privacy Policy
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
            Privacy Policy
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: colors.text, opacity: 0.9 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            We collect information that you provide directly to us, including:
          </Typography>
          <Box component="ul" sx={{ mb: 3, pl: 3, color: colors.text, opacity: 0.9 }}>
            <li>Account information (name, email address, GitHub profile)</li>
            <li>Profile information (avatar, username)</li>
            <li>Usage data and preferences</li>
            <li>Communication data when you contact us</li>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            We use the information we collect to:
          </Typography>
          <Box component="ul" sx={{ mb: 3, pl: 3, color: colors.text, opacity: 0.9 }}>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            3. Information Sharing
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            We may share your information with:
          </Typography>
          <Box component="ul" sx={{ mb: 3, pl: 3, color: colors.text, opacity: 0.9 }}>
            <li>Service providers who assist in our operations</li>
            <li>Professional advisors</li>
            <li>Law enforcement when required by law</li>
            <li>Other parties with your consent</li>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            4. Data Security
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            5. Your Rights
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            You have the right to:
          </Typography>
          <Box component="ul" sx={{ mb: 3, pl: 3, color: colors.text, opacity: 0.9 }}>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            6. Cookies and Tracking
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            We use cookies and similar tracking technologies to track activity on our service and
            hold certain information. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            7. Children's Privacy
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            Our service does not address anyone under the age of 13. We do not knowingly collect
            personally identifiable information from children under 13.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            8. Changes to This Policy
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last updated" date.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 500 }}>
            9. Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: colors.text, opacity: 0.9 }}>
            If you have any questions about this Privacy Policy, please contact us at
            support@buildsmith.com
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default PrivacyPolicy;
