import { styled } from "@mui/material/styles";
import { Box, Typography, Grid, Button, Card, CardMedia, Chip, Paper, IconButton } from "@mui/material";
import { colors } from "../../theme/colors";

export const FeaturedCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'scale(1.02)',
    }
}));

export const GameCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
    }
}));

export const StyledCardMedia = styled(CardMedia)({
    width: '100%',
    height: '100%',
    objectFit: 'cover'
});

export const CardOverlay = styled(Box)({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    color: 'white',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)'
});

export const GameTitle = styled(Typography)({
    color: 'white',
    fontWeight: 600,
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
});

export const VersionChip = styled(Chip)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    borderRadius: theme.spacing(0.75),
    height: 24,
    '& .MuiChip-label': {
        fontSize: '0.75rem',
        fontWeight: 500
    }
}));

export const StyledButton = styled(Button, {
    shouldForwardProp: prop => prop !== 'variant'
})(({ theme, variant }) => ({
    ...(variant === 'featured' ? {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        padding: '8px 24px',
        fontSize: '1.1rem',
        '&:hover': {
            backgroundColor: theme.palette.primary.dark
        }
    } : {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
        }
    }),
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    fontWeight: 600
}));

export const CarouselButton = styled(IconButton)({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: colors.text,
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
});

export const InfoPopper = styled(Paper)({
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border}`,
    borderRadius: '2px',
    color: colors.text,
    overflow: 'hidden',
    width: '380px',
});

export const PopperHeader = styled(Box)({
    padding: '16px',
    borderBottom: `1px solid ${colors.border}`,
});

export const PopperBody = styled(Box)({
    padding: '16px',
});

export const ReviewSection = styled(Box)({
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    marginTop: '12px',
    borderRadius: '2px',
});

export const TagChip = styled(Chip)({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.text,
    height: '22px',
    fontSize: '0.75rem',
    margin: '0 4px 4px 0',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});

export const ScreenshotImage = styled('img')({
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '8px',
}); 