import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SimulationInput } from '../types';

interface RightSectionProps {
    inputs: SimulationInput;
}

export const RightSection: React.FC<RightSectionProps> = ({ inputs }) => {
    return (
        <Box sx={{
            mt: 3,
            p: 2,
            borderLeft: '4px solid #9ca3af',
            bgcolor: '#f9fafb',
            borderRadius: 1,
            fontSize: '0.875rem',
            color: '#4b5563'
        }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: '#374151' }}>
                Principal: A Closer Look at Cash Out vs. Cash Lost
            </Typography>
            <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                Your <strong>Total Cash Out</strong> includes the <strong>Total Principal Paid</strong>. This is because principal payments are cash that has left your liquid assets and been invested into the property. While this portion of your cash out is not permanently lost (it is converted into home equity and is returned to you in the <strong>Net Sale Proceeds</strong>), it is also not available for other investments during the holding period. The <strong>Total Interest Paid</strong> and other running costs, on the other hand, represent the 'cash lost' portion of your investment.
            </Typography>
        </Box>
    );
};

