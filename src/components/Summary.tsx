
import React from 'react';
import type { SimulationResult, SimulationInput } from '../types';
import { format } from '../formatters';

interface SummaryProps {
    results: SimulationResult;
    inputs: SimulationInput;
}

export const Summary: React.FC<SummaryProps> = ({ results, inputs }) => {
    const actualMonthlyCost = Math.abs(results.monthlyCashFlow);
    const flowLabel = 'Monthly Cost of Ownership';

    return (
        <div id="cost-summary" className="mt-10 p-6 bg-red-50 rounded-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Cost of Ownership Summary (Monthly)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-500">Monthly Mortgage Payment</p>
                    <p className="text-xl font-semibold text-gray-700">{format(results.monthlyMortgagePayment, 'currency')}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Monthly Running Costs (Monthly Hausgeld)</p>
                    <p className="text-xl font-semibold text-gray-700">{format(inputs.monthlyHausgeldFull, 'currency')}</p>
                </div>
                <div className={`p-3 rounded-lg shadow-lg bg-red-200`}>
                    <p className="text-sm font-bold text-red-800">{flowLabel} (Total Monthly Cost)</p>
                    <p className="text-2xl font-extrabold text-red-700">{format(actualMonthlyCost, 'currency')}</p>
                </div>
            </div>
        </div>
    );
};
