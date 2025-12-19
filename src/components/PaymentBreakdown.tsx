
import React from 'react';
import { Box, Card, Typography, CardContent } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import type { SimulationResult } from '../types';
import { format } from '../formatters';
import { colors, spacing, borderRadius, elevation, transitions, typography } from '../theme/colors';

interface PaymentBreakdownProps {
    results: SimulationResult;
}

export const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ results }) => {
    const { t } = useTranslation();

    return (
        <Box id="payment-breakdown-summary" sx={{
            mt: spacing.xl,
            p: spacing.lg,
            bgcolor: colors.primary[50],
            borderRadius: borderRadius.lg,
            border: `2px solid ${colors.primary[200]}`
        }}>
            <Typography
                component="h2"
                sx={{
                    ...typography.sectionHeader,
                    color: colors.primary[900],
                    mb: spacing.sm
                }}
            >
                {t('breakdown.title')}
            </Typography>
            <Typography variant="body2" sx={{
                color: colors.text.secondary,
                mb: spacing.md,
                fontSize: '0.875rem',
                lineHeight: 1.6
            }}>
                <Trans i18nKey="breakdown.description">
                    This shows how the <strong>Total Monthly Payment</strong> is initially divided between the cost of borrowing (Interest) and debt reduction (Principal). This division changes every month.
                </Trans>
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
                            <Typography variant="caption" sx={{
                                color: colors.text.secondary,
                                display: 'block',
                                mb: 1
                            }}>
                                {t('breakdown.total_payment')}
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
                        bgcolor: colors.error[50],
                        border: `2px solid ${colors.error[200]}`,
                        boxShadow: elevation[1],
                        borderRadius: borderRadius.md,
                        transition: `all ${transitions.normal}`,
                        '&:hover': {
                            boxShadow: elevation[2],
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: spacing.md }}>
                            <Typography variant="caption" sx={{
                                color: colors.error[900],
                                display: 'block',
                                mb: 1
                            }}>
                                {t('breakdown.interest')}
                            </Typography>
                            <Typography sx={{
                                ...typography.number,
                                fontSize: '1.5rem',
                                color: colors.error[700]
                            }}>
                                {format(results.firstMonthInterest, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card sx={{
                        bgcolor: colors.success[50],
                        border: `2px solid ${colors.success[200]}`,
                        boxShadow: elevation[1],
                        borderRadius: borderRadius.md,
                        transition: `all ${transitions.normal}`,
                        '&:hover': {
                            boxShadow: elevation[2],
                            transform: 'translateY(-2px)',
                        }
                    }}>
                        <CardContent sx={{ p: spacing.md }}>
                            <Typography variant="caption" sx={{
                                color: colors.success[900],
                                display: 'block',
                                mb: 1
                            }}>
                                {t('breakdown.principal')}
                            </Typography>
                            <Typography sx={{
                                ...typography.number,
                                fontSize: '1.5rem',
                                color: colors.success[700]
                            }}>
                                {format(results.firstMonthPrincipal, 'currency')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
