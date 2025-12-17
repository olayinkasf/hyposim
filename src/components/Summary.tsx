
import React from 'react';
import { Box, Card, Typography, CardContent } from '@mui/material';
import type { SimulationResult, SimulationInput } from '../types';
import { format } from '../formatters';

interface SummaryProps {
    results: SimulationResult;
    inputs: SimulationInput;
}

export const Summary: React.FC<SummaryProps> = ({ results, inputs }) => {
    const actualMonthlyCost = Math.abs(results.monthlyCashFlow);
    const flowLabel = 'Monthly Cost of Ownership';

    return (
        <Box id="cost-summary" sx={{ mt: 5, p: 3, bgcolor: '#fee2e2', borderRadius: 2 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#991b1b', mb: 2 }}>
                Cost of Ownership Summary (Monthly)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                    <Card elevation={0}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Monthly Mortgage Payment
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
                                {format(results.monthlyMortgagePayment, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card elevation={0}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Monthly Running Costs (Monthly Hausgeld)
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
                                {format(inputs.monthlyHausgeldFull, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card elevation={0} sx={{ bgcolor: '#fecaca' }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#991b1b' }}>
                                {flowLabel} (Total Monthly Cost)
                            </Typography>
                            <Typography variant="h4" component="p" sx={{ fontWeight: 800, color: '#b91c1c' }}>
                                {format(actualMonthlyCost, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
