import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../../theme/colors';

export const VersionChip = styled(Chip)({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(5px)',
  border: `1px solid ${colors.border}`,
  borderRadius: '2px',
  color: colors.text,
  height: '24px',
  fontSize: '0.75rem',
  zIndex: 2,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
});
