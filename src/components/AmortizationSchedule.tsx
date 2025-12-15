
import React, { useState } from 'react';
import type { SimulationResult, SimulationInput, AmortizationData } from '../types';
import { format } from '../formatters';

interface AmortizationScheduleProps {
    results: SimulationResult;
    inputs: SimulationInput;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({ results, inputs }) => {
    const [isScheduleVisible, setIsScheduleVisible] = useState(false);

    return (
        <div id="amortization-schedule" className="mt-10 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <button
                onClick={() => setIsScheduleVisible(!isScheduleVisible)}
                className="w-full text-left py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-xl font-bold text-gray-700 flex justify-between items-center transition duration-150"
            >
                Monthly Amortization Schedule ({inputs.yearsToSell} Years)
                <span className="text-base">{isScheduleVisible ? '▲ Hide Details' : '▼ Show Details'}</span>
            </button>

            {results.amortizationSchedule && isScheduleVisible && (
                <div className="mt-4 overflow-x-auto max-h-[400px] border border-gray-300 rounded-lg shadow-inner">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-1/12">Month</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase w-3/12">Interest Paid</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase w-3/12">Principal Paid</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase w-5/12">Remaining Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {results.amortizationSchedule.map((item: AmortizationData) => (
                                <tr key={item.month} className="hover:bg-blue-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.month}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-red-600">{format(item.interest, 'currency')}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-green-600">{format(item.principal, 'currency')}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-800">{format(item.remainingBalance, 'currency')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
