
import type { SimulationInput, SimulationResult, RenderData, AmortizationData } from './types';
import { format } from './formatters';

const calculateSimulation = (inputs: SimulationInput): SimulationResult => {
    const results = {} as SimulationResult;

    // 1. Transaction Costs
    results.transferTax = inputs.purchasePrice * inputs.taxTransfer;
    results.notaryAndLandRegistryCost = inputs.purchasePrice * inputs.taxNotary;
    results.brokerCommission = inputs.purchasePrice * inputs.taxBroker;
    results.totalTransactionCosts = results.transferTax + results.notaryAndLandRegistryCost + results.brokerCommission;

    // 2. I. Total Project Cost
    results.totalInvestmentBase = inputs.purchasePrice + inputs.renovationBudget;
    results.totalProjectCost = results.totalInvestmentBase + results.totalTransactionCosts;

    // 3. II. Initial Outlay & Financing
    const totalInitialOutlay = inputs.cashDownPayment;
    results.totalInitialOutlay = totalInitialOutlay;

    results.netEquityAppliedToAsset = totalInitialOutlay - results.totalTransactionCosts;
    results.loanRequired = results.totalProjectCost - results.totalInitialOutlay;

    // Debt Service
    results.annualDebtServiceRate = inputs.interestRate + inputs.amortizationRate;
    results.annualDebtService = results.loanRequired * results.annualDebtServiceRate;
    results.monthlyMortgagePayment = results.annualDebtService / 12;

    // --- First Month Payment Breakdown ---
    const monthlyInterestRate = inputs.interestRate / 12;
    results.firstMonthInterest = results.loanRequired * monthlyInterestRate;
    results.firstMonthPrincipal = results.monthlyMortgagePayment - results.firstMonthInterest;

    // 4. III. Cost of Ownership
    results.annualHausgeldFull = inputs.monthlyHausgeldFull * 12;
    results.annualRentalIncome = inputs.monthlyRentalIncome * 12;
    // New: External Rent Calculation
    results.annualExternalRent = inputs.monthlyExternalRent * 12;

    results.totalAnnualRunningCost = results.annualHausgeldFull;

    // Update Total Annual Cost: Add External Rent, Subtract Rental Income
    results.totalAnnualCost = results.annualDebtService + results.totalAnnualRunningCost - results.annualRentalIncome + results.annualExternalRent;
    results.annualCashFlow = -results.totalAnnualCost;
    results.monthlyCashFlow = results.annualCashFlow / 12;

    // --- 5. LONG-TERM AMORTIZATION SCHEDULE (IV) ---
    let balance = results.loanRequired;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    const monthsToSell = inputs.yearsToSell * 12;
    const monthlyPayment = results.monthlyMortgagePayment;
    let monthsToRepay = 0;
    let fullyRepaid = false;

    const monthlyAmortizationSchedule: AmortizationData[] = [];

    for (let month = 1; balance > 0 && month <= monthsToSell + 12 * 50; month++) {
        const interestForMonth = balance * monthlyInterestRate;
        let principalPayment = monthlyPayment - interestForMonth;

        if (balance < principalPayment) {
            principalPayment = balance;
            balance = 0;
        } else {
            balance -= principalPayment;
        }

        totalInterestPaid += interestForMonth;
        totalPrincipalPaid += principalPayment;

        if (month <= monthsToSell) {
            monthlyAmortizationSchedule.push({
                month: month,
                interest: interestForMonth,
                principal: principalPayment,
                remainingBalance: balance,
            });

            results.totalInterestPaid = totalInterestPaid;
            results.totalPrincipalPaid = totalPrincipalPaid;
            results.loanBalanceAtSale = balance;
        }

        if (balance <= 0 && !fullyRepaid) {
            monthsToRepay = month;
            fullyRepaid = true;
        }
    }

    results.repaymentYears = monthsToRepay > 0 ? monthsToRepay / 12 : 'N/A';

    const futureValue = inputs.purchasePrice * Math.pow(1 + inputs.annualAppreciationRate, inputs.yearsToSell);
    results.estimatedSaleValue = futureValue;

    results.totalRunningCostPeriod = results.totalAnnualRunningCost * inputs.yearsToSell;
    results.totalRentalIncomePeriod = results.annualRentalIncome * inputs.yearsToSell;
    // New: Total External Rent Period
    results.totalExternalRentPeriod = results.annualExternalRent * inputs.yearsToSell;

    // Total Cash Out Calculation: Add External Rent
    results.totalCashOut = results.totalInitialOutlay + results.totalInterestPaid + results.totalRunningCostPeriod - results.totalRentalIncomePeriod + results.totalExternalRentPeriod;

    results.netSaleProceeds = results.estimatedSaleValue - results.loanBalanceAtSale;
    results.netProceeds = results.netSaleProceeds - results.totalCashOut;

    results.amortizationSchedule = monthlyAmortizationSchedule;

    if (monthsToSell === 0 || results.loanRequired === 0) {
        results.totalInterestPaid = 0;
        results.loanBalanceAtSale = 0;
        results.estimatedSaleValue = inputs.purchasePrice;
        results.totalRunningCostPeriod = 0;
        results.totalExternalRentPeriod = 0; // Reset
        results.totalPrincipalPaid = 0;
        // Update 0-year cash out logic
        results.totalCashOut = results.totalInitialOutlay + results.totalInterestPaid + results.totalRunningCostPeriod + results.totalPrincipalPaid + results.totalExternalRentPeriod;
        results.netSaleProceeds = results.estimatedSaleValue;
        results.netProceeds = results.netSaleProceeds - results.totalCashOut;
        if (results.loanRequired === 0) results.repaymentYears = 0;
    }

    return results;
};


export const getRenderData = (inputs: SimulationInput): { renderData: RenderData[], results: SimulationResult } => {
    const results = calculateSimulation(inputs);

    const renderData: RenderData[] = [
        // I. PROJECT CAPITAL & ASSET VALUE
        { section: 'I. Project Capital & Asset Value', lines: [
            { L: 1, metric: 'Purchase Price (PP)', value: inputs.purchasePrice, format: 'currency', calc: 'Contract price.', isInput: true, stateKey: 'purchasePrice' },
            { L: 2, metric: 'Transfer Tax Rate', value: inputs.taxTransfer, format: 'percent', calc: 'Tax Rate.', isInput: true, stateKey: 'taxTransfer', isPercent: true, inputHighlight: true, evaluatedDisplay: format(results.transferTax, 'currency') },
            { L: 3, metric: 'Property Transfer Tax Cost', value: results.transferTax, format: 'currency', calc: `Purchase Price * Transfer Tax Rate` },
            { L: 4, metric: 'Notary & Land Registry Rate', value: inputs.taxNotary, format: 'percent', calc: 'Fee Rate.', isInput: true, stateKey: 'taxNotary', isPercent: true, inputHighlight: true, evaluatedDisplay: format(results.notaryAndLandRegistryCost, 'currency') },
            { L: 5, metric: 'Renovation Budget (RENO)', value: inputs.renovationBudget, format: 'currency', calc: 'Planned improvements.', isInput: true, stateKey: 'renovationBudget' },
            { L: 6, metric: 'Notary & Land Registry Cost', value: results.notaryAndLandRegistryCost, format: 'currency', calc: `Purchase Price * Notary & Land Registry Rate` },
            { L: 7, metric: 'Broker Commission Rate', value: inputs.taxBroker, format: 'percent', calc: 'Broker Rate.', isInput: true, stateKey: 'taxBroker', isPercent: true, inputHighlight: true, evaluatedDisplay: format(results.brokerCommission, 'currency') },
            { L: 8, metric: 'Broker Commission Cost', value: results.brokerCommission, format: 'currency', calc: `Purchase Price * Broker Commission Rate` },
            { L: 9, metric: 'Total Transaction Costs (TTC)', value: results.totalTransactionCosts, format: 'currency', calc: 'Property Transfer Tax Cost + Notary & Land Registry Cost + Broker Commission Cost' },
            { L: 10, metric: 'TOTAL INVESTMENT BASE (TIB)', value: results.totalInvestmentBase, format: 'currency', calc: 'Purchase Price + Renovation Budget (The Appreciable Asset Value)', highlight: true },
            { L: 11, metric: 'Property Size', value: inputs.propertySizeSqm, format: 'm²', calc: 'Kreuzberg, Baujahr 1958.', isInput: true, stateKey: 'propertySizeSqm', step: '1' },
        ]},
        // II. EQUITY AND DEBT STRUCTURE
        { section: 'II. Equity and Debt Structure', lines: [
            { L: 12, metric: 'Cash Down Payment (DP)', value: inputs.cashDownPayment, format: 'currency', calc: 'Initial cash committed.', isInput: true, stateKey: 'cashDownPayment' },
            { L: 13, metric: 'TOTAL INITIAL OUTLAY (TIO)', value: results.totalInitialOutlay, format: 'currency', calc: 'Fixed cash input.' },
            {
                L: 14,
                metric: `Net Equity Applied to Asset (${format(results.netEquityAppliedToAsset / (results.totalInvestmentBase || 1), 'percent')} of TIB)`,
                value: results.netEquityAppliedToAsset,
                format: 'currency',
                calc: `Total Initial Outlay - Total Transaction Costs.`
            },
            {
                L: 15,
                metric: `LOAN REQUIRED (LR) (${format(results.loanRequired / (results.totalInvestmentBase || 1), 'percent')} of TIB)`,
                value: results.loanRequired,
                format: 'currency',
                calc: `Total Investment Base + Total Transaction Costs - Total Initial Outlay.`,
                highlight: true
            },

            { L: 16, metric: 'Interest Rate (IR)', value: inputs.interestRate, format: 'percent', calc: 'Input: 10-Year Fixed', isInput: true, stateKey: 'interestRate', isPercent: true },
            { L: 17, metric: 'Amortization Rate (AMORT)', value: inputs.amortizationRate, format: 'percent', calc: 'Set by borrower.', isInput: true, stateKey: 'amortizationRate', isPercent: true },
            { L: 18, metric: 'Total Annual Debt Service Rate', value: results.annualDebtServiceRate, format: 'percent', calc: 'Interest Rate + Amortization Rate' },
            { L: 19, metric: 'ANNUAL DEBT SERVICE (ADS)', value: results.annualDebtService, format: 'currency', calc: 'Loan Required * Total Annual Debt Service Rate' },
            { L: 20, metric: 'Monthly Mortgage Payment', value: results.monthlyMortgagePayment, format: 'currency', calc: 'Annual Debt Service / 12' },
        ]},
        // III. COST OF OWNERSHIP (Owner-Occupier)
        { section: 'III. Monthly Cost of Ownership', lines: [
            { L: 21, metric: 'Monthly Hausgeld (Full)', value: inputs.monthlyHausgeldFull, format: 'currency', calc: `Full WEG payment.`, isInput: true, stateKey: 'monthlyHausgeldFull' },
            { L: 22, metric: 'Monthly Rental Income (Sublet)', value: inputs.monthlyRentalIncome, format: 'currency', calc: 'Income from renting out part of property.', isInput: true, stateKey: 'monthlyRentalIncome', inputHighlight: true },
            {
                L: 23,
                metric: 'Monthly External Rent Payment',
                value: inputs.monthlyExternalRent,
                format: 'currency',
                calc: 'Rent paid for another property (<strong>Cash Out</strong>).',
                isInput: true,
                stateKey: 'monthlyExternalRent',
                step: '10'
            },
            {
                L: 24,
                metric: 'DESIRED MONTHLY COST OF OWNERSHIP',
                value: inputs.desiredMonthlyCost,
                format: 'currency',
                calc: 'Target monthly cost for comparison.',
                isInput: true,
                stateKey: 'desiredMonthlyCost',
                inputHighlight: true
            },
            {
                L: 25,
                metric: 'ACTUAL MONTHLY EXPENSE (Total Cash Out)',
                value: Math.abs(results.monthlyCashFlow),
                format: 'currency',
                calc: 'Total Annual Ownership Cost / 12',
                highlight: true,
                isCost: true
            },
        ]},
        // IV. LONG-TERM PROJECTION
        { section: 'IV. Long-Term Projection (Asset P&L)', lines: [
            { L: 26, metric: 'Sell After X Years', value: inputs.yearsToSell, format: 'number', calc: 'Holding period for calculation.', isInput: true, stateKey: 'yearsToSell', step: '1' },
            { L: 27, metric: 'Annual Appreciation Rate (R%)', value: inputs.annualAppreciationRate, format: 'percent', calc: 'Assumed annual value increase.', isInput: true, stateKey: 'annualAppreciationRate', isPercent: true, inputHighlight: true },
            {
                L: 28,
                metric: `Total Interest Paid (over ${inputs.yearsToSell} years)`,
                value: results.totalInterestPaid,
                format: 'currency',
                calc: 'Total cost of borrowing over the period (<strong>pure loss</strong>).'
            },
            {
                L: 29,
                metric: `Total Principal Paid (over ${inputs.yearsToSell} years)`,
                value: results.totalPrincipalPaid,
                format: 'currency',
                calc: 'The cash converted from debt to <strong>equity</strong>. This is a form of <strong>savings</strong>, not a financial loss.',
            },
            { L: 30, metric: `Loan Balance After ${inputs.yearsToSell} Years`, value: results.loanBalanceAtSale, format: 'currency', calc: 'Remaining debt paid at closing.' },
            { L: 31, metric: `Total External Rent Paid (over ${inputs.yearsToSell} years)`, value: results.totalExternalRentPeriod, format: 'currency', calc: 'Monthly External Rent * 12 * Years to Sell.'},
            { L: 32, metric: `Total Running Costs (over ${inputs.yearsToSell} years)`, value: results.totalRunningCostPeriod, format: 'currency', calc: 'Total Annual Running Costs * Years to Sell'},
            { L: 33, metric: `Estimated Sale Value (after ${inputs.yearsToSell} years)`, value: results.estimatedSaleValue, format: 'currency', calc: `Purchase Price * (1 + Annual Appreciation Rate) ^ Years to Sell` },
            {
                L: 34,
                metric: `TOTAL CASH OUT (Irreversible Costs)`,
                value: results.totalCashOut,
                format: 'currency',
                calc: 'Initial Outlay + Interest + Running Costs + <strong>External Rent</strong> - Rental Income.',
                highlight: true,
                isCost: true
            },
            {
                L: 35,
                metric: `NET SALE PROCEEDS (Total Inflow)`,
                value: results.netSaleProceeds,
                format: 'currency',
                calc: 'Estimated Sale Value - Loan Balance After X Years. <strong>Total Principal Paid</strong> reduces the loan balance, thus increasing your <strong>cash inflow</strong>.',
                highlight: true,
                flow: true
            },
            {
                L: 36,
                metric: `ESTIMATED TOTAL NET WEALTH CHANGE (Asset P&L)`,
                value: results.netProceeds,
                format: 'currency',
                calc: '<strong>NET SALE PROCEEDS (Total Inflow)</strong> - <strong>TOTAL CASH OUT (Total Irreversible Costs)</strong>',
                highlight: true,
                flow: true
            },
            { L: 37, metric: 'Fully Repaid After Y Years', value: typeof results.repaymentYears === 'number' ? results.repaymentYears : 0, format: 'number', calc: 'Loan Required amortization time at Monthly Mortgage Payment', highlight: true },
        ]},
    ];

    return { renderData, results };
};
