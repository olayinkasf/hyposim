
import { useState, useMemo } from 'react';
import type { SimulationInput } from '../types';
import { getRenderData } from '../data.tsx';

const initialInputs: SimulationInput = {
    purchasePrice: 369000.00,
    renovationBudget: 31000.00,
    cashDownPayment: 100000.00,

    taxTransfer: 0.060,
    taxNotary: 0.015,
    taxBroker: 0.0357,

    interestRate: 0.0370,
    amortizationRate: 0.0200,

    propertySizeSqm: 66,
    monthlyHausgeldFull: 295.73,
    monthlyRentalIncome: 1000.00,

    desiredMonthlyCost: 1500.00,

    monthlyExternalRent: 0.00,
    yearsToSell: 10,
    annualAppreciationRate: 0.020,
};

export const useSimulation = () => {
    const [inputs, setInputs] = useState<SimulationInput>(initialInputs);

    const handleInputChange = (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => {
        let numericValue = parseFloat(value);
        if (isNaN(numericValue)) numericValue = 0;

        if (isPercent) {
            numericValue = numericValue / 100;
        }

        setInputs((prev: SimulationInput) => ({
            ...prev,
            [name]: numericValue,
        }));
    };

    const handleReset = () => {
        setInputs(initialInputs);
    };

    const { results, renderData } = useMemo(() => getRenderData(inputs), [inputs]);

    return { inputs, results, renderData, handleInputChange, handleReset };
};
