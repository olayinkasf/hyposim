
import React from 'react';
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
        <div id="simulation-results" className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">L</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[65%]">Metric & Details</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Value (Edit Here)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {renderData.map((section, sectionIndex) => (
                        <React.Fragment key={sectionIndex}>
                            <tr>
                                <td colSpan={3} className="px-6 py-4 bg-gray-100 text-left text-sm font-bold text-gray-700 uppercase tracking-wider rounded-t-lg">
                                    {section.section}
                                </td>
                            </tr>
                            {section.lines.map((line, lineIndex) => (
                                <TableRow key={lineIndex} line={line} inputs={inputs} handleInputChange={handleInputChange} desiredMonthlyCost={desiredMonthlyCost}/>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
