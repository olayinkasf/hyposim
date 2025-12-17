
import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { SimulationInput, RenderLine } from '../types';

interface EditableValueProps {
    line: RenderLine;
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
}

const StyledInput = styled('input')({
    border: 'none',
    textAlign: 'right',
    flexGrow: 1,
    backgroundColor: 'transparent',
    fontSize: '0.875rem', // Match TextField's small size
    padding: '8.5px 8px', // Match TextField's padding
    '&:focus': {
        outline: 'none',
    },
    '&[type=number]': {
        '-moz-appearance': 'textfield',
    },
    '&[type=number]::-webkit-outer-spin-button, &[type=number]::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
    },
});

export const EditableValue: React.FC<EditableValueProps> = ({ line, inputs, handleInputChange }) => {
    const value = line.isPercent ? (inputs[line.stateKey!] * 100) : inputs[line.stateKey!];
    const unit = line.isPercent ? '%' : (line.format === 'currency' ? '€' : (line.stateKey === 'yearsToSell' ? 'Years' : line.format));
    const displayValue = (value as number).toFixed(unit === 'm²' || line.stateKey === 'yearsToSell' ? 0 : 2);
    const step = line.isPercent ? '0.01' : (line.format === 'currency' ? '100' : '1');

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center', // Keep items aligned horizontally
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            width: '12rem',
            marginLeft: 'auto',
            backgroundColor: line.inputHighlight ? '#fefcbf' : 'transparent',
            '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.87)',
            }
        }}>
            <StyledInput
                type="number"
                name={line.stateKey}
                value={displayValue}
                onChange={(e) => handleInputChange(line.stateKey!, e.target.value, line.isPercent)}
                step={step}
            />
            <Box sx={{
                borderLeft: '1px solid rgba(0, 0, 0, 0.23)',
                p: '4px 10px',
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                alignSelf: 'stretch',
                display: 'flex',
                alignItems: 'center',
            }}>
                <Typography variant="body2" color="text.secondary">{unit}</Typography>
            </Box>
        </Box>
    );
};
