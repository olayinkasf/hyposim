
import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SimulationInput } from '../types';

interface FooterProps {
    inputs: SimulationInput;
}

export const Footer: React.FC<FooterProps> = ({ inputs }) => {
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
                Explaining Principal (Equity vs. Cost) over {inputs.yearsToSell} Years:
            </Typography>
            <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                The calculation above treats <strong>Total Principal Paid</strong> as your own money converted into <strong>equity (savings)</strong>, not a lifetime cost.
            </Typography>
            <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                This is why you only pay back the <strong>Loan Balance After {inputs.yearsToSell} Years</strong> when you sell. The principal you paid effectively returns to you in the <strong>NET SALE PROCEEDS</strong>.
            </Typography>
            <Typography variant="body2" component="p" sx={{ mt: 1, fontWeight: 600, color: '#1f2937' }}>
                Alternative View (If Principal is counted as Cash Out):
            </Typography>
            <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                If you included the <strong>Total Principal Paid</strong> in your <strong>TOTAL CASH OUT (Irreversible Costs)</strong>, then that cash is counted as a 'lost' expense. Claiming it as a loss means that you haven't paid back any part of your loan to the bank. To maintain mathematical consistency, the model would then require you to pay the <strong>Loan Required</strong> (the full original loan amount) back to the bank upon sale.
            </Typography>
        </Box>
    );
};
