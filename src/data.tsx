import type {SimulationInput, SimulationResult, RenderData, AmortizationData} from './types';
import {format} from './formatters';

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
        {
            section: 'I. Project Capital & Asset Value', lines: [
                {
                    metric: 'Property Purchase Price',
                    value: inputs.purchasePrice,
                    format: 'currency',
                    isInput: true,
                    stateKey: 'purchasePrice'
                },
                {
                    metric: 'Transfer Tax Rate',
                    value: inputs.taxTransfer,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'taxTransfer',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.transferTax, 'currency')
                },
                {
                    metric: 'Notary & Land Registry Rate',
                    value: inputs.taxNotary,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'taxNotary',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.notaryAndLandRegistryCost, 'currency')
                },
                {
                    metric: 'Broker Commission Rate',
                    value: inputs.taxBroker,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'taxBroker',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.brokerCommission, 'currency')
                },
                {
                    metric: `Total Transfer Cost`,
                    value: results.totalTransactionCosts,
                    format: 'currency',
                    calc: `Tax + Broker + Notary = ${format(inputs.taxBroker + inputs.taxTransfer + inputs.taxNotary, 'percent')} of Purchase Price`
                },
                {
                    metric: 'Renovation Cost',
                    value: inputs.renovationBudget,
                    format: 'currency',
                    isInput: true,
                    stateKey: 'renovationBudget'
                },
                {
                    metric: 'Total Cost of Property',
                    value: results.totalInvestmentBase,
                    calc: 'Purchase Price + Renovation',
                    format: 'currency',
                    stateKey: 'purchasePrice'
                },
                {
                    metric: 'Total Cost of Investment',
                    value: results.totalProjectCost,
                    format: 'currency',
                    calc: 'Purchase Price + Transfer Cost + Renovation',
                    color: 'highlight'
                },
            ]
        },
        // II. EQUITY AND DEBT STRUCTURE
        {
            section: 'II. Equity and Debt Structure', lines: [
                {
                    metric: 'Cash Down Payment',
                    value: inputs.cashDownPayment,
                    format: 'currency',
                    isInput: true,
                    stateKey: 'cashDownPayment'
                },
                {
                    metric: `Loan Required - ${format(results.loanRequired / (results.totalInvestmentBase || 1), 'percent')} financing`,
                    value: results.loanRequired,
                    format: 'currency',
                    calc: 'Total Cost of Investment - Cash Down Payment',
                    color: 'highlight'
                },
                {
                    metric: 'Interest Rate - 10 Year Fixed',
                    value: inputs.interestRate,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'interestRate',
                    isPercent: true
                },
                {
                    metric: 'Amortization Rate',
                    value: inputs.amortizationRate,
                    format: 'percent',
                    calc: 'Set by borrower.',
                    isInput: true,
                    stateKey: 'amortizationRate',
                    isPercent: true
                },
                {
                    metric: 'Total Annual Debt Service Rate',
                    value: results.annualDebtServiceRate,
                    format: 'percent',
                    calc: 'Interest Rate + Amortization Rate',
                    evaluatedDisplay: format(results.annualDebtService, 'currency')
                },
                {
                    metric: 'Monthly Mortgage Payment',
                    value: results.monthlyMortgagePayment,
                    format: 'currency',
                    calc: 'Annual Debt Service / 12',
                    color: 'highlight'
                },
            ]
        },
        // III. COST OF OWNERSHIP (Owner-Occupier)
        {
            section: 'III. Monthly Cost of Ownership', lines: [
                {
                    metric: 'Monthly Hausgeld',
                    value: inputs.monthlyHausgeldFull,
                    format: 'currency',
                    calc: `Full WEG payment.`,
                    isInput: true,
                    stateKey: 'monthlyHausgeldFull',
                },
                {
                    metric: 'Monthly Rental Income (Sublet)',
                    value: inputs.monthlyRentalIncome,
                    format: 'currency',
                    calc: 'Income from renting out part of property.',
                    isInput: true,
                    stateKey: 'monthlyRentalIncome',
                    inputHighlight: true,
                    color: "green"
                },
                {
                    metric: 'Monthly Rent Payment',
                    value: inputs.monthlyExternalRent,
                    format: 'currency',
                    calc: 'Rent paid for another property (<strong>Cash Out</strong>).',
                    isInput: true,
                    stateKey: 'monthlyExternalRent',
                    step: '10'
                },
                {
                    metric: 'Desired Monthly Cost of Ownership',
                    value: inputs.desiredMonthlyCost,
                    format: 'currency',
                    calc: 'Target monthly cost for comparison.',
                    isInput: true,
                    stateKey: 'desiredMonthlyCost',
                    inputHighlight: true
                },
                {
                    metric: 'Net Monthly Expense (Cash out)',
                    value: Math.abs(results.monthlyCashFlow),
                    format: 'currency',
                    calc: results.monthlyCashFlow > 0 ? "Cash in" : 'Cash out',
                    color: results.monthlyCashFlow > 0
                        ? 'green' : Math.abs(results.monthlyCashFlow) > inputs.desiredMonthlyCost
                            ? 'red' : 'highlight',
                    evaluatedDisplay: format(Math.abs(results.monthlyCashFlow) * 12 * inputs.yearsToSell, 'currency'),
                    evaluatedDescription: `after ${inputs.yearsToSell} years`,
                    isCost: true
                },
            ]
        },
        // IV. LONG-TERM PROJECTION
        {
            section: 'IV. Long-Term Projection (Asset P&L)', lines: [
                {
                    metric: `Sell property after ${inputs.yearsToSell} years`,
                    value: inputs.yearsToSell,
                    format: 'number',
                    isInput: true,
                    stateKey: 'yearsToSell',
                    step: '1'
                },
                {
                    metric: 'Annual Appreciation Rate',
                    value: inputs.annualAppreciationRate,
                    format: 'percent',
                    calc: 'Assumed annual value increase of property',
                    isInput: true,
                    stateKey: 'annualAppreciationRate',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.estimatedSaleValue, 'currency'),
                    evaluatedDescription: `after ${inputs.yearsToSell} years`
                },

                {
                    metric: `Total Interest Paid (over ${inputs.yearsToSell} years)`,
                    value: results.totalInterestPaid,
                    format: 'currency',
                    calc: 'Total cost of borrowing over the period (<strong>pure loss</strong>).',
                    color: results.totalInterestPaid > 0 ? 'red' : undefined
                },
                {
                    metric: `Total Principal Paid (over ${inputs.yearsToSell} years)`,
                    value: results.totalPrincipalPaid,
                    format: 'currency',
                    calc: 'The cash converted from debt to <strong>equity</strong>. This is a form of <strong>savings</strong>, not a financial loss.',
                },
                {
                    metric: `Loan Balance After ${inputs.yearsToSell} Years`,
                    value: results.loanBalanceAtSale,
                    format: 'currency',
                    calc: 'Loan Required - Total Principal Paid'
                },
                {
                    metric: `Total Cash Out`,
                    value: inputs.cashDownPayment + results.totalAnnualCost * inputs.yearsToSell,
                    format: 'currency',
                    calc: 'Cash Down Payment + Total Cost of Ownership',
                    color: 'red',
                    isCost: true
                },
                {
                    metric: `Total Cash Lost`,
                    value: inputs.cashDownPayment + results.totalAnnualCost * inputs.yearsToSell - results.totalPrincipalPaid,
                    format: 'currency',
                    calc: 'Total Cash Out - Total Principal Paid',
                    color: 'red',
                    isCost: true
                },
                {
                    metric: `Net Sale Proceeds`,
                    value: results.netSaleProceeds,
                    format: 'currency',
                    calc: 'Estimated Sale Value - Loan Balance After X Years. <strong>Total Principal Paid</strong> reduces the loan balance, thus increasing your <strong>cash inflow</strong>.',
                    color: 'green',
                    flow: true
                },
                {
                    metric: `Total Net Wealth Change (Asset P&L)`,
                    value: results.netProceeds,
                    format: 'currency',
                    calc: 'Net Sale Proceeds - Total Cash Lost',
                    color: results.netProceeds > 0 ? 'green' : 'red',
                    flow: true
                },
                {
                    metric: 'Fully Repaid After Years',
                    value: typeof results.repaymentYears === 'number' ? results.repaymentYears : 0,
                    format: 'number',
                    calc: 'Loan  Required amortization time at Monthly Mortgage Payment',
                    color: 'yellow'
                },
            ]
        },
    ];
    return {renderData, results};
};
