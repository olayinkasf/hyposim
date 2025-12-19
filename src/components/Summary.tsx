
import React from 'react';
import { Box, Card, Typography, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SimulationResult, SimulationInput } from '../types';
import { format } from '../formatters';
import { colors, spacing, borderRadius, elevation, transitions, typography } from '../theme/colors';

interface SummaryProps {
    results: SimulationResult;
    inputs: SimulationInput;
}

export const Summary: React.FC<SummaryProps> = ({ results, inputs }) => {
    const { t } = useTranslation();
    const actualMonthlyCost = Math.abs(results.monthlyCashFlow);

    return (
        <Box id="cost-summary" sx={{
            mt: spacing.xl,
            p: spacing.lg,
            bgcolor: colors.warning[50],
            borderRadius: borderRadius.lg,
            border: `2px solid ${colors.warning[200]}`
        }}>
            <Typography
                component="h2"
                sx={{
                    ...typography.sectionHeader,
                    color: colors.warning[900],
                    mb: spacing.md
                }}
            >
                {t('summary.title')}
            </Typography>
            <Box sx={{ display: 'flex', gap: spacing.md, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                    <Card sx={{
                        boxShadow: elevation[1],
                        borderRadius: borderRadius.md,
                        transition: `all ${transitions.normal}`,
                        '&:hover': {
                            boxShadow: elevation[2],
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: spacing.md }}>
                            <Typography variant="caption" sx={{ color: colors.text.secondary, display: 'block', mb: 1 }}>
                                {t('summary.mortgage_payment')}
                            </Typography>
                            <Typography sx={{
                                ...typography.number,
                                fontSize: '1.5rem',
                                color: colors.text.primary
                            }}>
                                {format(results.monthlyMortgagePayment, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card sx={{
                        boxShadow: elevation[1],
                        borderRadius: borderRadius.md,
                        transition: `all ${transitions.normal}`,
                        '&:hover': {
                            boxShadow: elevation[2],
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: spacing.md }}>
                            <Typography variant="caption" sx={{ color: colors.text.secondary, display: 'block', mb: 1 }}>
                                {t('summary.running_costs')}
                            </Typography>
                            <Typography sx={{
                                ...typography.number,
                                fontSize: '1.5rem',
                                color: colors.text.primary
                            }}>
                                {format(inputs.monthlyHausgeldFull, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card sx={{
                        bgcolor: colors.warning[100],
                        border: `2px solid ${colors.warning[300]}`,
                        boxShadow: elevation[2],
                        borderRadius: borderRadius.md,
                        transition: `all ${transitions.normal}`,
                        '&:hover': {
                            boxShadow: elevation[3],
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: spacing.md }}>
                            <Typography variant="caption" sx={{
                                color: colors.warning[900],
                                fontWeight: 600,
                                display: 'block',
                                mb: 1
                            }}>
                                {t('summary.total_cost')}
                            </Typography>
                            <Typography sx={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: colors.warning[700]
                            }}>
                                {format(actualMonthlyCost, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
