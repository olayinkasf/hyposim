import React from 'react';
import {TableRow as MuiTableRow, TableCell, Typography, Box} from '@mui/material';
import {sanitizeHTMLMinimal} from '../utils/sanitize';
import type {RenderLine, SimulationInput} from '../types';
import {format} from '../formatters';
import {EditableValue} from './EditableValue';
import { colors, spacing, transitions } from '../theme/colors';

interface TableRowProps {
    line: RenderLine;
    lineNumber: number;
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
    color?: 'highlight' | 'red' | 'green' | 'yellow';
    isEvenRow?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
                                                      line,
                                                      lineNumber,
                                                      inputs,
                                                      handleInputChange,
                                                      color,
                                                      isEvenRow = false
                                                  }) => {
    let valueText = '';

    if (!line.isInput) {
        if (line.format === 'currency') valueText = format(line.value, 'currency');
        else if (line.format === 'percent') valueText = format(line.value, 'percent');
        else if (line.format === 'm²') valueText = format(line.value, 'm²');
        else if (line.metric === 'Fully Repaid After Y Years') valueText = `${format(line.value, 'number')} Years`;
        else valueText = format(line.value, 'number');
    }

    const calcContent = line.calc;

    const getRowStyling = () => {
        let baseStyle = {
            transition: `all ${transitions.fast}`,
            '&:hover': {
                bgcolor: colors.primary[50],
            }
        };

        switch (color) {
            case 'highlight':
                return { ...baseStyle, bgcolor: colors.primary[100], '&:hover': { bgcolor: colors.primary[200] } };
            case 'red':
                return { ...baseStyle, bgcolor: colors.error[50], '&:hover': { bgcolor: colors.error[100] } };
            case 'green':
                return { ...baseStyle, bgcolor: colors.success[50], '&:hover': { bgcolor: colors.success[100] } };
            case 'yellow':
                return { ...baseStyle, bgcolor: colors.warning[50], '&:hover': { bgcolor: colors.warning[100] } };
            default:
                return {
                    ...baseStyle,
                    bgcolor: isEvenRow ? colors.background.base : colors.neutral[50]
                };
        }
    }

    const getValueStyling = () => {
        switch (color) {
            case 'red':
                return {color: colors.error[700], fontWeight: 700};
            case 'green':
                return {color: colors.success[700], fontWeight: 700};
            case 'highlight':
                return {color: colors.text.primary, fontWeight: 600};
            default:
                return {color: colors.text.primary, fontWeight: 500};
        }
    }

    return (
        <MuiTableRow sx={getRowStyling()}>
            <TableCell sx={{
                whiteSpace: 'nowrap',
                color: colors.text.muted,
                py: spacing.sm,
                px: spacing.md,
                fontSize: '0.75rem'
            }}>
                {lineNumber}.
            </TableCell>
            <TableCell sx={{ py: spacing.sm, px: spacing.md }}>
                <Typography variant="body2" sx={{
                    fontWeight: color === 'highlight' ? 600 : 400,
                    color: color === 'highlight' ? colors.text.primary : colors.text.secondary,
                    fontSize: '0.875rem'
                }}>
                    {line.metric}
                    {calcContent && (
                        <>
                            <br/>
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                    color: colors.text.muted,
                                    fontSize: '0.75rem',
                                    lineHeight: 1.5
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHTMLMinimal(calcContent)
                                }}
                            />
                        </>
                    )}
                </Typography>
            </TableCell>
            <TableCell align="right" sx={{
                ...getValueStyling(),
                py: spacing.sm,
                px: spacing.md,
                fontSize: '0.875rem'
            }}>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                    {line.isInput && line.stateKey ?
                        <EditableValue line={{...line, stateKey: line.stateKey}} inputs={inputs}
                                       handleInputChange={handleInputChange}/> : valueText}
                    {(line.evaluatedDescription || line.evaluatedDisplay) && (
                        <Box sx={{display: 'flex', alignItems: 'baseline', mt: 0.5}}>
                            <Typography variant="caption"
                                        sx={{
                                            fontSize: '0.7rem',
                                            color: colors.text.muted,
                                            mr: 0.5
                                        }}>
                                {(line.evaluatedDescription || "") + " = " + line.evaluatedDisplay}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </TableCell>
        </MuiTableRow>
    );
};
