
import React from 'react';
import type { SimulationInput } from '../types';

interface FooterProps {
    inputs: SimulationInput;
}

export const Footer: React.FC<FooterProps> = ({ inputs }) => {
    return (
        <div className="mt-6 p-4 border-l-4 border-gray-400 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h3 className="font-semibold text-gray-700">Explaining Principal (Equity vs. Cost) over {inputs.yearsToSell} Years:</h3>
            <p>
                The calculation above treats <strong>Total Principal Paid</strong> as your own money converted into <strong>equity (savings)</strong>, not a lifetime cost.
            </p>
            <p className="mt-2">
                This is why you only pay back the <strong>Loan Balance After {inputs.yearsToSell} Years</strong> when you sell. The principal you paid effectively returns to you in the <strong>NET SALE PROCEEDS</strong>.
            </p>
            <p className="mt-2 font-semibold text-gray-800">
                Alternative View (If Principal is counted as Cash Out):
            </p>
            <p>
                If you included the <strong>Total Principal Paid</strong> in your <strong>TOTAL CASH OUT (Irreversible Costs)</strong>, then that cash is counted as a 'lost' expense. Claiming it as a loss means that you haven't paid back any part of your loan to the bank. To maintain mathematical consistency, the model would then require you to pay the <strong>Loan Required</strong> (the full original loan amount) back to the bank upon sale.
            </p>
        </div>
    );
};
