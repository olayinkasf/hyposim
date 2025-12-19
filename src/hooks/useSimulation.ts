import { useState, useMemo } from 'react';
import type { SimulationInput } from '../types';
import { getRenderData } from '../data.tsx';
import { useTranslation } from 'react-i18next';
import { clamp } from '../utils/validation';

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
    const { t } = useTranslation();
    const [inputs, setInputs] = useState<SimulationInput>(initialInputs);

    const handleInputChange = (name: keyof SimulationInput, value: string, isPercent: boolean | undefined) => {
        let numericValue = parseFloat(value);
        if (isNaN(numericValue)) numericValue = 0;

        if (isPercent) {
            numericValue = numericValue / 100;
        }

        // Input validation with reasonable ranges
        const validatedValue = validateInput(name, numericValue);

        setInputs((prev: SimulationInput) => ({
            ...prev,
            [name]: validatedValue,
        }));
    };

    const validateInput = (name: keyof SimulationInput, value: number): number => {
        switch (name) {
            // Monetary values: 0 to 100 million
            case 'purchasePrice':
            case 'renovationBudget':
            case 'cashDownPayment':
            case 'monthlyHausgeldFull':
            case 'monthlyRentalIncome':
            case 'monthlyExternalRent':
            case 'desiredMonthlyCost':
                return clamp(value, 0, 100000000);

            // Tax and rate percentages: 0% to 100% (stored as decimals)
            case 'taxTransfer':
            case 'taxNotary':
            case 'taxBroker':
                return clamp(value, 0, 1.0);

            // Interest and appreciation rates: 0% to 50% (stored as decimals)
            case 'interestRate':
            case 'amortizationRate':
                return clamp(value, 0, 0.5);

            // Annual appreciation: -10% to 50% (stored as decimals)
            case 'annualAppreciationRate':
                return clamp(value, -0.1, 0.5);

            // Years: 0 to 100 years
            case 'yearsToSell':
                return clamp(value, 0, 100);

            // Property size: 1 to 10000 sqm
            case 'propertySizeSqm':
                return clamp(value, 1, 10000);

            default:
                return value;
        }
    };

    const { results, renderData } = useMemo(() => getRenderData(inputs, t), [inputs, t]);

    return { inputs, results, renderData, handleInputChange };
};
