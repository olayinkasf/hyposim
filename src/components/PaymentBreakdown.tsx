
import React from 'react';
import { Box, Card, Typography, CardContent } from '@mui/material';
import type { SimulationResult } from '../types';
import { format } from '../formatters';

interface PaymentBreakdownProps {
    results: SimulationResult;
}

export const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ results }) => {
    return (
        <Box id="payment-breakdown-summary" sx={{ mt: 5, p: 3, bgcolor: '#eff6ff', borderRadius: 2, border: '2px solid #bfdbfe' }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#1e40af', mb: 2 }}>
                First Monthly Mortgage Payment Breakdown
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This shows how the <strong>Total Monthly Payment</strong> is initially divided between the cost of borrowing (Interest) and debt reduction (Principal). This division changes every month.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Monthly Payment
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ fontWeight: 800, color: '#374151' }}>
                                {format(results.monthlyMortgagePayment, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card sx={{ bgcolor: '#fee2e2', border: '1px solid #fecaca' }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: '#991b1b' }}>
                                Interest Portion (Cost)
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ fontWeight: 700, color: '#b91c1c' }}>
                                {format(results.firstMonthInterest, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card sx={{ bgcolor: '#dcfce7', border: '1px solid #bbf7d0' }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: '#14532d' }}>
                                Principal Portion (Equity)
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ fontWeight: 700, color: '#15803d' }}>
                                {format(results.firstMonthPrincipal, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
