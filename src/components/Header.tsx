
import React from 'react';
import { Typography, Box } from '@mui/material';

export const Header: React.FC = () => {
    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            bgcolor: '#f9fafb',
            zIndex: 1100,
            p: { xs: 1, sm: 2 },
            borderBottom: '1px solid #f3f4f6'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.jpg" alt="Hyposim Logo" style={{ height: '40px', marginRight: '16px' }} />
                <div>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#1f2937' }}>
                        Hyposim Berlin
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Owner-Occupier Cost & Equity Simulator
                    </Typography>
                </div>
            </Box>
        </Box>
    );
};
