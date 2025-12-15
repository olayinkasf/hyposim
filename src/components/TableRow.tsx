import React from 'react';
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
    let rowClasses = line.highlight ? 'bg-blue-50' : '';
    let valueClasses = 'text-gray-900';

    if (!line.isInput) {
        if (line.format === 'currency') valueText = format(line.value, 'currency');
        else if (line.format === 'percent') valueText = format(line.value, 'percent');
        else if (line.format === 'm²') valueText = format(line.value, 'm²');
        else if (line.L === 34) valueText = `${format(line.value, 'number')} Years`;
        else valueText = format(line.value, 'number');
    }

    if (line.L === 22) {
        const isOverBudget = line.value > desiredMonthlyCost;
        valueClasses = isOverBudget ? 'text-red-800 font-extrabold' : 'text-green-700 font-extrabold';
        rowClasses = isOverBudget ? 'bg-red-300 border-2 border-red-500' : 'bg-green-100';
        valueText = format(line.value, 'currency');
    } else if (line.L === 20 && line.value > 0) {
        valueClasses = 'text-red-600 font-bold';
        rowClasses = 'bg-red-50';
    } else if (line.L === 31) {
        valueClasses = 'text-red-700 font-extrabold';
        rowClasses = 'bg-red-100';
        valueText = format(line.value, 'currency');
    } else if (line.L === 32) {
        valueClasses = 'text-green-700 font-extrabold';
        rowClasses = 'bg-green-100';
        valueText = format(line.value, 'currency');
    } else if (line.L === 33) {
        const isPositive = line.value > 0;
        valueClasses = isPositive ? 'text-green-700 font-extrabold' : 'text-red-700 font-extrabold';
        rowClasses = isPositive ? 'bg-green-100' : 'bg-red-100';
        valueText = format(line.value, 'currency');
    } else if (line.L === 34) {
        rowClasses = 'bg-yellow-100';
    }

    const calcContent = line.calc;

    return (
        <tr className={rowClasses}>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 align-top">{line.L}.</td>
            <td className="px-6 py-3 text-sm align-top">
                <div className={`font-medium ${line.highlight ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>
                    {line.metric}
                </div>
                <div
                    className="text-xs text-gray-500 mt-1 font-normal leading-relaxed"
                    dangerouslySetInnerHTML={{__html: calcContent}}
                />
            </td>
            <td className={`px-6 py-3 whitespace-nowrap text-sm text-right align-top ${valueClasses}`}>
                {line.isInput && line.stateKey ?
                    <EditableValue line={{...line, stateKey: line.stateKey}} inputs={inputs}
                                   handleInputChange={handleInputChange}/> : valueText}
            </td>
        </tr>
    );
};
