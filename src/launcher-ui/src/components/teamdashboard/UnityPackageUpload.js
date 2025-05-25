import React from 'react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { colors } from '../../theme/colors';

const UnityPackageUpload = ({
  unityPackages,
  scanning,
  uploadingPackages,
  uploadedPackages,
  cdnPackages,
  onUpload,
}) => {
  if (unityPackages.length === 0 && !scanning) {
    return (
      <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
        No Unity Packages found.
      </Typography>
    );
  }

  if (scanning) {
    return (
      <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
        Scanning for Unity Packages...
      </Typography>
    );
  }

  return (
    <Box sx={{ maxHeight: 320, overflowY: 'auto', padding: 1 }}>
      <Stack spacing={1}>
        {[...unityPackages]
          .sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
          .map(pkg => {
            const isUploading = uploadingPackages.has(pkg.path);
            const isUploaded = uploadedPackages.includes(pkg.path);
            const packageId = pkg.name.replace('.unitypackage', '');
            const existsInCdn = cdnPackages.some(cdnPkg => cdnPkg.package_id === packageId);
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
                  if (!isUploading && !isUploaded) onUpload(pkg);
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FolderIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {packageId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, ml: 1 }}>
                    {pkg.size ? `${(pkg.size / 1024 / 1024).toFixed(1)} MB` : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, ml: 1 }}>
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
  );
};

export default UnityPackageUpload;
