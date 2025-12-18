import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <Box sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'text.secondary'
        }}>
            <Typography variant="body2" component="p" sx={{ mb: 1 }}>
                Last Updated: {new Date().toLocaleDateString('en-CA')}
            </Typography>
            <Box sx={{ fontFamily: 'inherit', fontWeight: 'inherit', typography: 'body2', }}>
                <MuiLink component={RouterLink} to="/impressum" sx={{
                    mx: 1,
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}>
                    Impressum (Legal Notice)
                </MuiLink>
                |
                <MuiLink component={RouterLink} to="/privacy" sx={{
                    mx: 1,
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}>
                    Datenschutzerklärung (Privacy Policy)
                </MuiLink>
            </Box>
        </Box>
    );
};
