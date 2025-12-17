
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow as MuiTableRow,
    Paper
} from '@mui/material';
import type { RenderData, SimulationInput } from '../types';
import { TableRow } from './TableRow';

interface ResultsTableProps {
    renderData: RenderData[];
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
    desiredMonthlyCost: number;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ renderData, inputs, handleInputChange, desiredMonthlyCost }) => {
    return (
        <TableContainer component={Paper} elevation={0} id="simulation-results" sx={{ height: '100%', overflow: 'auto' }}>
            <Table sx={{ minWidth: 650 }} stickyHeader aria-label="simulation results table">
                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                    <MuiTableRow>
                        <TableCell sx={{ width: '5%', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>L</TableCell>
                        <TableCell sx={{ width: '65%', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metric & Details</TableCell>
                        <TableCell align="right" sx={{ width: '30%', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value (Edit Here)</TableCell>
                    </MuiTableRow>
                </TableHead>
                <TableBody>
                    {renderData.map((section, sectionIndex) => (
                        <React.Fragment key={sectionIndex}>
                            <MuiTableRow>
                                <TableCell colSpan={3} sx={{
                                    bgcolor: '#f3f4f6',
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
                                <TableRow key={lineIndex} line={line} inputs={inputs} handleInputChange={handleInputChange} desiredMonthlyCost={desiredMonthlyCost}/>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
