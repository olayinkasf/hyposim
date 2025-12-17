import React from 'react';
import { TableRow as MuiTableRow, TableCell, Typography, Box } from '@mui/material';
import type {RenderLine, SimulationInput} from '../types';
import {format} from '../formatters';
import {EditableValue} from './EditableValue';

interface TableRowProps {
    line: RenderLine;
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
    desiredMonthlyCost: number;
}

export const TableRow: React.FC<TableRowProps> = ({line, inputs, handleInputChange, desiredMonthlyCost}) => {
    let valueText = '';

    if (!line.isInput) {
        if (line.format === 'currency') valueText = format(line.value, 'currency');
        else if (line.format === 'percent') valueText = format(line.value, 'percent');
        else if (line.format === 'm²') valueText = format(line.value, 'm²');
        else if (line.L === 37) valueText = `${format(line.value, 'number')} Years`;
        else valueText = format(line.value, 'number');
    }

    if (line.L === 25) {
        valueText = format(line.value, 'currency');
    } else if (line.L === 34) {
        valueText = format(line.value, 'currency');
    } else if (line.L === 35) {
        valueText = format(line.value, 'currency');
    } else if (line.L === 36) {
        valueText = format(line.value, 'currency');
    }

    const calcContent = line.calc;

    const getRowStyling = () => {
        if (line.highlight) {
            return { bgcolor: '#eff6ff' };
        }
        if (line.L === 25) {
            const isOverBudget = line.value > desiredMonthlyCost;
            return isOverBudget ?
                { bgcolor: '#fecaca', border: '2px solid #ef4444' } :
                { bgcolor: '#dcfce7' };
        }
        if (line.L === 23 && line.value > 0) {
            return { bgcolor: '#fee2e2' };
        }
        if (line.L === 34) {
            return { bgcolor: '#fee2e2' };
        }
        if (line.L === 35) {
            return { bgcolor: '#dcfce7' };
        }
        if (line.L === 36) {
            const isPositive = line.value > 0;
            return isPositive ?
                { bgcolor: '#dcfce7' } :
                { bgcolor: '#fee2e2' };
        }
        if (line.L === 37) {
            return { bgcolor: '#fef9c3' };
        }
        return {};
    }

    const getValueStyling = () => {
        if (line.L === 25) {
            const isOverBudget = line.value > desiredMonthlyCost;
            return isOverBudget ?
                { color: '#991b1b', fontWeight: 800 } :
                { color: '#15803d', fontWeight: 800 };
        }
        if (line.L === 23 && line.value > 0) {
            return { color: '#dc2626', fontWeight: 700 };
        }
        if (line.L === 34) {
            return { color: '#b91c1c', fontWeight: 800 };
        }
        if (line.L === 35) {
            return { color: '#16a34a', fontWeight: 800 };
        }
        if (line.L === 36) {
            const isPositive = line.value > 0;
            return isPositive ?
                { color: '#16a34a', fontWeight: 800 } :
                { color: '#b91c1c', fontWeight: 800 };
        }
        return {};
    }

    return (
        <MuiTableRow sx={getRowStyling()}>
            <TableCell sx={{whiteSpace: 'nowrap', color: '#6b7280'}}>{line.L}.</TableCell>
            <TableCell>
                <Typography variant="body2" sx={{ fontWeight: line.highlight ? 700 : 500, color: line.highlight ? '#111827' : 'inherit' }}>
                    {line.metric}
                    {calcContent && (
                        <>
                            <br/>
                            <Typography component="span" variant="caption" sx={{ color: '#6b7280' }} dangerouslySetInnerHTML={{__html: calcContent}}/>
                        </>
                    )}
                </Typography>
            </TableCell>
            <TableCell align="right" sx={getValueStyling()}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {line.isInput && line.stateKey ?
                        <EditableValue line={{...line, stateKey: line.stateKey}} inputs={inputs}
                                       handleInputChange={handleInputChange}/> : valueText}
                    {line.evaluatedDisplay && (
                        <Box sx={{ display: 'flex', alignItems: 'baseline', marginTop: '4px' }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', marginRight: '4px' }}>
                                =
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: 'inherit',
                                fontWeight: 500,
                            }}>
                                {line.evaluatedDisplay}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </TableCell>
        </MuiTableRow>
    );
};
