
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
import { colors, spacing, borderRadius, elevation, transitions } from '../theme/colors';

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
        <Box id="amortization-schedule" sx={{
            mt: spacing.xl,
            p: spacing.lg,
            bgcolor: colors.neutral[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.neutral[200]}`
        }}>
            <Button
                onClick={() => setIsScheduleVisible(!isScheduleVisible)}
                fullWidth
                sx={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    p: spacing.md,
                    bgcolor: colors.neutral[100],
                    color: colors.text.primary,
                    borderRadius: borderRadius.md,
                    textTransform: 'none',
                    boxShadow: elevation[0],
                    transition: `all ${transitions.normal}`,
                    '&:hover': {
                        bgcolor: colors.neutral[200],
                        boxShadow: elevation[1]
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
                <TableContainer
                    component={Paper}
                    sx={{
                        mt: spacing.md,
                        maxHeight: 400,
                        boxShadow: elevation[1],
                        borderRadius: borderRadius.md,
                        overflow: 'auto'
                    }}
                >
                    <Table stickyHeader aria-label="amortization schedule">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{
                                    width: '15%',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    bgcolor: colors.neutral[100],
                                    py: spacing.sm,
                                    backdropFilter: 'blur(8px)'
                                }}>
                                    {viewMode === 'yearly' && shouldUseYearlyView ? t('amortization.year') : t('amortization.month')}
                                </TableCell>
                                <TableCell align="right" sx={{
                                    width: '28%',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    bgcolor: colors.neutral[100],
                                    py: spacing.sm,
                                    backdropFilter: 'blur(8px)'
                                }}>{t('amortization.interest_paid')}</TableCell>
                                <TableCell align="right" sx={{
                                    width: '28%',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    bgcolor: colors.neutral[100],
                                    py: spacing.sm,
                                    backdropFilter: 'blur(8px)'
                                }}>{t('amortization.principal_paid')}</TableCell>
                                <TableCell align="right" sx={{
                                    width: '29%',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    bgcolor: colors.neutral[100],
                                    py: spacing.sm,
                                    backdropFilter: 'blur(8px)'
                                }}>{t('amortization.remaining_balance')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayData.map((item: AmortizationData, index: number) => (
                                <TableRow
                                    key={item.month}
                                    sx={{
                                        bgcolor: index % 2 === 0 ? colors.background.base : colors.neutral[50],
                                        transition: `background-color ${transitions.fast}`,
                                        '&:hover': {
                                            bgcolor: colors.primary[50],
                                        }
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{
                                        color: colors.text.secondary,
                                        py: spacing.sm,
                                        fontSize: '0.875rem'
                                    }}>
                                        {viewMode === 'yearly' && shouldUseYearlyView ? `${t('amortization.year')} ${Math.floor(item.month / 12)}` : item.month}
                                    </TableCell>
                                    <TableCell align="right" sx={{
                                        color: colors.error[700],
                                        fontWeight: 500,
                                        py: spacing.sm,
                                        fontSize: '0.875rem'
                                    }}>{format(item.interest, 'currency')}</TableCell>
                                    <TableCell align="right" sx={{
                                        color: colors.success[700],
                                        fontWeight: 500,
                                        py: spacing.sm,
                                        fontSize: '0.875rem'
                                    }}>{format(item.principal, 'currency')}</TableCell>
                                    <TableCell align="right" sx={{
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        py: spacing.sm,
                                        fontSize: '0.875rem'
                                    }}>{format(item.remainingBalance, 'currency')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
        </Box>
    );
};
