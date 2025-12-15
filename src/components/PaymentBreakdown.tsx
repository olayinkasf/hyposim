
import React from 'react';
import type { SimulationResult } from '../types';
import { format } from '../formatters';

interface PaymentBreakdownProps {
    results: SimulationResult;
}

export const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ results }) => {
    return (
        <div id="payment-breakdown-summary" className="mt-10 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">First Monthly Mortgage Payment Breakdown</h2>
            <p className="text-sm text-gray-600 mb-4">
                This shows how the <strong>Total Monthly Payment</strong> is initially divided between the cost of borrowing (Interest) and debt reduction (Principal). This division changes every month.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Monthly Payment</p>
                    <p className="text-2xl font-extrabold text-gray-700">{format(results.monthlyMortgagePayment, 'currency')}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg shadow-inner border border-red-300">
                    <p className="text-sm text-red-800">Interest Portion (Cost)</p>
                    <p className="text-2xl font-bold text-red-700">{format(results.firstMonthInterest, 'currency')}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg shadow-inner border border-green-300">
                    <p className="text-sm text-green-800">Principal Portion (Equity)</p>
                    <p className="text-2xl font-bold text-green-700">{format(results.firstMonthPrincipal, 'currency')}</p>
                </div>
            </div>
        </div>
    );
};
