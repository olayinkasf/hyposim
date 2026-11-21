import { useState, useMemo } from 'react';
import type { SimulationInput } from '../types';
import { getRenderData } from '../data.tsx';
import { useTranslation } from 'react-i18next';
import { clamp } from '../utils/validation';

export const defaultInputs: SimulationInput = {
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

    monthlyExternalRent: 0.00,
    monthlyRentAvoided: 0.00,
    yearsToSell: 10,
    annualAppreciationRate: 0.020,

    fixedRateYears: 10,
    rateAfterFixed: 0.0500,
    monthlyMaintenanceReserve: 66.00,
    specialLevies: 0.00,
    sellingCostRate: 0.0357,
    investmentReturnRate: 0.0500,
    rentGrowthRate: 0.0300,
    costGrowthRate: 0.0200,
    investmentTaxRate: 0.26375,
    capitalGainsTaxRate: 0.0,
    monthlyPropertyTax: 30.00,
    vacancyRate: 0.0400,
    renovationValueShare: 0.50,
    annualExtraRepayment: 0.00,
};

// Fill in any fields missing from older saved flats or links.
export const withDefaults = (partial: Partial<SimulationInput>): SimulationInput => {
    const merged = { ...defaultInputs };
    for (const key of Object.keys(defaultInputs) as (keyof SimulationInput)[]) {
        const v = partial[key];
        if (typeof v === 'number' && Number.isFinite(v)) merged[key] = v;
    }
    return merged;
};

export const encodeInputs = (inputs: SimulationInput): string =>
    btoa(unescape(encodeURIComponent(JSON.stringify(inputs))));

const inputsFromUrl = (): SimulationInput => {
    try {
        const s = new URLSearchParams(window.location.search).get('s');
        if (!s) return defaultInputs;
        return withDefaults(JSON.parse(decodeURIComponent(escape(atob(s)))));
    } catch {
        return defaultInputs;
    }
};

export const useSimulation = () => {
    const { t } = useTranslation();
    const [inputs, setInputs] = useState<SimulationInput>(inputsFromUrl);
    const loadInputs = (next: Partial<SimulationInput>) => setInputs(withDefaults(next));

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
            case 'monthlyRentAvoided':
            case 'monthlyMaintenanceReserve':
            case 'specialLevies':
            case 'monthlyPropertyTax':
            case 'annualExtraRepayment':
                return clamp(value, 0, 100000000);

            // Tax and rate percentages: 0% to 100% (stored as decimals)
            case 'taxTransfer':
            case 'taxNotary':
            case 'taxBroker':
                return clamp(value, 0, 1.0);

            // Interest and appreciation rates: 0% to 50% (stored as decimals)
            case 'interestRate':
            case 'amortizationRate':
            case 'rateAfterFixed':
            case 'investmentReturnRate':
                return clamp(value, 0, 0.5);

            case 'sellingCostRate':
            case 'investmentTaxRate':
            case 'capitalGainsTaxRate':
            case 'vacancyRate':
            case 'renovationValueShare':
                return clamp(value, 0, 1.0);

            case 'fixedRateYears':
                return clamp(value, 0, 40);

            // Annual appreciation: -10% to 50% (stored as decimals)
            case 'annualAppreciationRate':
            case 'rentGrowthRate':
            case 'costGrowthRate':
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

    return { inputs, results, renderData, handleInputChange, loadInputs };
};
