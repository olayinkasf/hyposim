
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
import { useTranslation } from 'react-i18next';
import type { SimulationResult, SimulationInput, AmortizationData } from '../types';
import { format } from '../formatters';

interface AmortizationScheduleProps {
    results: SimulationResult;
    inputs: SimulationInput;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({ results, inputs }) => {
    const { t } = useTranslation();
    const [isScheduleVisible, setIsScheduleVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('yearly');

    // For schedules longer than 36 months, default to yearly view for performance
    const shouldUseYearlyView = results.amortizationSchedule.length > 36;

    // Filter data based on view mode
    const displayData = viewMode === 'yearly' && shouldUseYearlyView
        ? results.amortizationSchedule.filter((item: AmortizationData) => item.month % 12 === 0 || item.month === results.amortizationSchedule.length)
        : results.amortizationSchedule;

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
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                        bgcolor: '#d1d5db',
                        boxShadow: 1
                    }
                }}
            >
                <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                    {t('amortization.title', { years: inputs.yearsToSell })}
                </Typography>
                <Typography variant="body2" component="span">
                    {isScheduleVisible ? t('amortization.hide') : t('amortization.show')}
                </Typography>
            </Button>

            <Collapse in={isScheduleVisible}>
                {shouldUseYearlyView && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            variant={viewMode === 'yearly' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('yearly')}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                px: 2,
                                fontWeight: viewMode === 'yearly' ? 600 : 400
                            }}
                        >
                            {t('amortization.yearly_view')}
                        </Button>
                        <Button
                            size="small"
                            variant={viewMode === 'monthly' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('monthly')}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                px: 2,
                                fontWeight: viewMode === 'monthly' ? 600 : 400
                            }}
                        >
                            {t('amortization.monthly_view')}
                        </Button>
                    </Box>
                )}
                <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
                    <Table stickyHeader aria-label="amortization schedule">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '8.333333%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>
                                    {viewMode === 'yearly' && shouldUseYearlyView ? t('amortization.year') : t('amortization.month')}
                                </TableCell>
                                <TableCell align="right" sx={{ width: '25%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>{t('amortization.interest_paid')}</TableCell>
                                <TableCell align="right" sx={{ width: '25%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>{t('amortization.principal_paid')}</TableCell>
                                <TableCell align="right" sx={{ width: '41.666667%', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>{t('amortization.remaining_balance')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayData.map((item: AmortizationData) => (
                                <TableRow key={item.month} hover>
                                    <TableCell component="th" scope="row" sx={{ color: '#4b5563' }}>
                                        {viewMode === 'yearly' && shouldUseYearlyView ? `${t('amortization.year')} ${Math.floor(item.month / 12)}` : item.month}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: '#b91c1c' }}>{format(item.interest, 'currency')}</TableCell>
                                    <TableCell align="right" sx={{ color: '#15803d' }}>{format(item.principal, 'currency')}</TableCell>
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
