import React from 'react';
import {TableRow as MuiTableRow, TableCell, Typography, Box} from '@mui/material';
import {sanitizeHTMLMinimal} from '../utils/sanitize';
import type {RenderLine, SimulationInput} from '../types';
import {format} from '../formatters';
import {EditableValue} from './EditableValue';

interface TableRowProps {
    line: RenderLine;
    lineNumber: number;
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
    color?: 'highlight' | 'red' | 'green' | 'yellow';
}

export const TableRow: React.FC<TableRowProps> = ({
                                                      line,
                                                      lineNumber,
                                                      inputs,
                                                      handleInputChange,
                                                      color
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
        let style = {};
        switch (color) {
            case 'highlight':
                style = {bgcolor: '#eff6ff'};
                break;
            case 'red':
                style = {bgcolor: '#fee2e2'};
                break;
            case 'green':
                style = {bgcolor: '#dcfce7'};
                break;
            case 'yellow':
                style = {bgcolor: '#fef9c3'};
                break;
            default:
                break;
        }
        return style;
    }

    const getValueStyling = () => {
        switch (color) {
            case 'red':
                return {color: '#b91c1c', fontWeight: 800};
            case 'green':
                return {color: '#15803d', fontWeight: 800};
            default:
                return {};
        }
    }

    return (
        <MuiTableRow sx={getRowStyling()}>
            <TableCell sx={{whiteSpace: 'nowrap', color: '#6b7280'}}>{lineNumber}.</TableCell>
            <TableCell>
                <Typography variant="body2" sx={{
                    fontWeight: color === 'highlight' ? 700 : 500,
                    color: color === 'highlight' ? '#111827' : 'inherit'
                }}>
                    {line.metric}
                    {calcContent && (
                        <>
                            <br/>
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{color: '#6b7280'}}
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHTMLMinimal(calcContent)
                                }}
                            />
                        </>
                    )}
                </Typography>
            </TableCell>
            <TableCell align="right" sx={getValueStyling()}>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                    {line.isInput && line.stateKey ?
                        <EditableValue line={{...line, stateKey: line.stateKey}} inputs={inputs}
                                       handleInputChange={handleInputChange}/> : valueText}
                    {(line.evaluatedDescription || line.evaluatedDisplay) && (
                        <Box sx={{display: 'flex', alignItems: 'baseline', marginTop: '4px'}}>
                            <Typography variant="caption"
                                        sx={{
                                            fontSize: '0.75rem',
                                            color: '#7e7e7e',
                                            marginRight: '4px'
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
