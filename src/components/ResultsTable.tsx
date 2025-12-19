import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow as MuiTableRow,
    Paper
} from '@mui/material';
import type {RenderData, SimulationInput} from '../types';
import {TableRow} from './TableRow';
import { colors, spacing, borderRadius, elevation, typography } from '../theme/colors';

interface ResultsTableProps {
    renderData: RenderData[];
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ renderData, inputs, handleInputChange }) => {
    // Calculate cumulative line numbers without mutation during render
    const getLineNumber = (sectionIndex: number, lineIndex: number): number => {
        let count = 0;
        for (let i = 0; i < sectionIndex; i++) {
            count += renderData[i].lines.length;
        }
        return count + lineIndex + 1;
    };

    return (
        <TableContainer
            component={Paper}
            id="simulation-results"
            sx={{
                height: '100%',
                overflow: 'auto',
                boxShadow: elevation[2],
                borderRadius: borderRadius.lg
            }}
        >
            <Table sx={{ minWidth: 650 }} aria-label="simulation results table">
                <TableBody>
                    {renderData.map((section, sectionIndex) => (
                        <React.Fragment key={sectionIndex}>
                            <MuiTableRow>
                                <TableCell colSpan={3} sx={{
                                    bgcolor: colors.neutral[100],
                                    textAlign: 'left',
                                    ...typography.cardTitle,
                                    py: spacing.md,
                                    px: spacing.md,
                                    color: colors.text.primary,
                                    borderBottom: `2px solid ${colors.neutral[300]}`,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 10,
                                    backdropFilter: 'blur(8px)'
                                }}>
                                    {section.section}
                                </TableCell>
                            </MuiTableRow>
                            {section.lines.map((line, lineIndex) => (
                                <TableRow
                                    key={lineIndex}
                                    lineNumber={getLineNumber(sectionIndex, lineIndex)}
                                    line={line}
                                    inputs={inputs}
                                    handleInputChange={handleInputChange}
                                    color={line.color}
                                    isEvenRow={(getLineNumber(sectionIndex, lineIndex) - 1) % 2 === 0}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
