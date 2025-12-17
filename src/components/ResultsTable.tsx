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
    desiredMonthlyCost: number;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
                                                              renderData,
                                                              inputs,
                                                              handleInputChange,
                                                              desiredMonthlyCost
                                                          }) => {
    return (
        <TableContainer id="simulation-results" sx={{height: '100%', overflow: 'auto'}}>
            <Table sx={{minWidth: 650}} aria-label="simulation results table">
                <TableBody>
                    {renderData.map((section, sectionIndex) => (
                        <React.Fragment key={sectionIndex}>
                            <MuiTableRow>
                                <TableCell colSpan={3} sx={{
                                    bgcolor: '#e6e6e6',
                                    textAlign: 'left',
                                    fontWeight: 700,
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {section.section}
                                </TableCell>
                            </MuiTableRow>
                            {section.lines.map((line, lineIndex) => (
                                <TableRow key={lineIndex} line={line} inputs={inputs}
                                          handleInputChange={handleInputChange}
                                          desiredMonthlyCost={desiredMonthlyCost}/>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
