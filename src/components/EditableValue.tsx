
import React from 'react';
import type { SimulationInput } from '../types';

interface EditableValueProps {
    line: {
        isPercent?: boolean;
        stateKey: keyof SimulationInput;
        format: 'currency' | 'percent' | 'm²' | 'number';
        inputHighlight?: boolean;
    };
    inputs: SimulationInput;
    handleInputChange: (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => void;
}

export const EditableValue: React.FC<EditableValueProps> = ({ line, inputs, handleInputChange }) => {
    const value = line.isPercent ? (inputs[line.stateKey] * 100) : inputs[line.stateKey];
    const unit = line.isPercent ? '%' : (line.format === 'currency' ? '€' : line.format);
    const step = line.isPercent ? '0.01' : (line.format === 'currency' ? '100' : '1');
    const displayValue = (value as number).toFixed(unit === 'm²' || line.stateKey === 'yearsToSell' ? 0 : 2);

    return (
        <div className={`relative flex rounded-md shadow-sm w-32 ml-auto ${line.inputHighlight ? 'bg-yellow-100' : ''}`}>
            <input
                type="number"
                name={line.stateKey}
                value={displayValue}
                onChange={(e) => handleInputChange(line.stateKey, e.target.value, line.isPercent)}
                step={step}
                className="flex-1 min-w-0 block w-full px-2 py-1 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
            />
            <span className="inline-flex items-center px-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {unit}
            </span>
        </div>
    );
};
