import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow as MuiTableRow
} from '@mui/material';
import type {RenderData, SimulationInput} from '../types';
import {TableRow} from './TableRow';

interface ResultsTableProps {
    renderData: RenderData[];
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ renderData, inputs, handleInputChange }) => {
    let lineNumber = 0;

    return (
        <TableContainer id="simulation-results" sx={{ height: '100%', overflow: 'auto' }}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="simulation results table">
                <TableBody>
                    {renderData.map((section, sectionIndex) => (
                        <React.Fragment key={sectionIndex}>
                            <MuiTableRow>
                                <TableCell colSpan={3} sx={{
                                    bgcolor: '#f3f4f6',
                                    textAlign: 'left',
                                    fontWeight: 700,
                                    color: '#374151'
                                }}>
                                    {section.section}
                                </TableCell>
                            </MuiTableRow>
                            {section.lines.map((line, lineIndex) => {
                                lineNumber++;
                                return <TableRow
                                    key={lineIndex}
                                    lineNumber={lineNumber}
                                    line={line}
                                    inputs={inputs}
                                    handleInputChange={handleInputChange}
                                    color={line.color}
                                />
                            })}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
