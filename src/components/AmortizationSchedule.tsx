
import React, { useState } from 'react';
import {
    Box,
    Button,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from '@mui/material';
import type { SimulationResult, SimulationInput, AmortizationData } from '../types';
import { format } from '../formatters';

interface AmortizationScheduleProps {
    results: SimulationResult;
    inputs: SimulationInput;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({ results, inputs }) => {
    const [isScheduleVisible, setIsScheduleVisible] = useState(false);

    return (
        <Box id="amortization-schedule" sx={{ mt: 5, p: 3, bgcolor: '#f9fafb', borderRadius: 2 }}>
            <Button
                onClick={() => setIsScheduleVisible(!isScheduleVisible)}
                fullWidth
                sx={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    p: 2,
                    bgcolor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': { bgcolor: '#d1d5db' }
                }}
            >
                <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                    Monthly Amortization Schedule ({inputs.yearsToSell} Years)
                </Typography>
                <Typography variant="body2" component="span">
                    {isScheduleVisible ? '▲ Hide Details' : '▼ Show Details'}
                </Typography>
            </Button>

            <Collapse in={isScheduleVisible}>
                <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
                    <Table stickyHeader aria-label="amortization schedule">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '8.333333%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Month</TableCell>
                                <TableCell align="right" sx={{ width: '25%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Interest Paid</TableCell>
                                <TableCell align="right" sx={{ width: '25%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Principal Paid</TableCell>
                                <TableCell align="right" sx={{ width: '41.666667%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>Remaining Balance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.amortizationSchedule.map((item: AmortizationData) => (
                                <TableRow key={item.month} hover>
                                    <TableCell component="th" scope="row" sx={{ color: '#4b5563' }}>
                                        {item.month}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: '#dc2626' }}>{format(item.interest, 'currency')}</TableCell>
                                    <TableCell align="right" sx={{ color: '#16a34a' }}>{format(item.principal, 'currency')}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 500, color: '#1f2937' }}>{format(item.remainingBalance, 'currency')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
        </Box>
    );
};
