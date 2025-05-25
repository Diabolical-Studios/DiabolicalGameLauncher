import React from 'react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { colors } from '../../theme/colors';

const UnityPackageDownload = ({ cdnPackages, loadingCdn, downloadingPackages, onDownload }) => {
  if (loadingCdn) {
    return (
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
    );
  }

  if (cdnPackages.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
        No CDN Unity Packages found.
      </Typography>
    );
  }

  return (
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
                if (!isDownloading) onDownload(pkg);
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                <Typography variant="body2" sx={{ color: colors.text }}>
                  {pkg.package_id}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary, ml: 1 }}>
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
                  <DownloadRoundedIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
                )}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default UnityPackageDownload;
