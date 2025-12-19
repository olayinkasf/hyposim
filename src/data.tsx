import type { TFunction } from 'i18next';
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
    // New: Total Rent Avoided Period
    results.totalRentAvoidedPeriod = inputs.monthlyRentAvoided * 12 * inputs.yearsToSell;
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
        results.totalRentAvoidedPeriod = 0; // Reset
        results.totalPrincipalPaid = 0;
        // Update 0-year cash out logic
        results.totalCashOut = results.totalInitialOutlay + results.totalInterestPaid + results.totalRunningCostPeriod + results.totalPrincipalPaid + results.totalExternalRentPeriod;
        results.netSaleProceeds = results.estimatedSaleValue;
        results.netProceeds = results.netSaleProceeds - results.totalCashOut;
        if (results.loanRequired === 0) results.repaymentYears = 0;
    }
    return results;
};

export const getRenderData = (inputs: SimulationInput, t: TFunction): { renderData: RenderData[], results: SimulationResult } => {
    const results = calculateSimulation(inputs);
    const renderData: RenderData[] = [
        // I. PROJECT CAPITAL & ASSET VALUE
        {
            section: t('table.section_title'), lines: [
                {
                    metric: t('table.property_purchase_price'),
                    value: inputs.purchasePrice,
                    format: 'currency',
                    isInput: true,
                    stateKey: 'purchasePrice'
                },
                {
                    metric: t('table.transfer_tax_rate'),
                    value: inputs.taxTransfer,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'taxTransfer',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.transferTax, 'currency')
                },
                {
                    metric: t('table.notary_and_land_registry_rate'),
                    value: inputs.taxNotary,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'taxNotary',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.notaryAndLandRegistryCost, 'currency')
                },
                {
                    metric: t('table.broker_commission_rate'),
                    value: inputs.taxBroker,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'taxBroker',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.brokerCommission, 'currency')
                },
                {
                    metric: t('table.total_transfer_cost'),
                    value: results.totalTransactionCosts,
                    format: 'currency',
                    calc: t('table.total_transfer_cost_calc', {val: format(inputs.taxBroker + inputs.taxTransfer + inputs.taxNotary, 'percent')})
                },
                {
                    metric: t('table.renovation_cost'),
                    value: inputs.renovationBudget,
                    format: 'currency',
                    isInput: true,
                    stateKey: 'renovationBudget'
                },
                {
                    metric: t('table.total_cost_of_property'),
                    value: results.totalInvestmentBase,
                    calc: t('table.total_cost_of_property_calc'),
                    format: 'currency',
                    stateKey: 'purchasePrice'
                },
                {
                    metric: t('table.total_cost_of_investment'),
                    value: results.totalProjectCost,
                    format: 'currency',
                    calc: t('table.total_cost_of_investment_calc'),
                    color: 'highlight'
                },
            ]
        },
        // II. EQUITY AND DEBT STRUCTURE
        {
            section: t('table.section_title_2'), lines: [
                {
                    metric: t('table.cash_down_payment'),
                    value: inputs.cashDownPayment,
                    format: 'currency',
                    isInput: true,
                    stateKey: 'cashDownPayment'
                },
                {
                    metric: t('table.loan_required', {val: format(results.loanRequired / (results.totalInvestmentBase || 1), 'percent')}),
                    value: results.loanRequired,
                    format: 'currency',
                    calc: t('table.loan_required_calc'),
                    color: 'highlight'
                },
                {
                    metric: t('table.interest_rate'),
                    value: inputs.interestRate,
                    format: 'percent',
                    isInput: true,
                    stateKey: 'interestRate',
                    isPercent: true
                },
                {
                    metric: t('table.amortization_rate'),
                    value: inputs.amortizationRate,
                    format: 'percent',
                    calc: t('table.amortization_rate_calc'),
                    isInput: true,
                    stateKey: 'amortizationRate',
                    isPercent: true
                },
                {
                    metric: t('table.total_annual_debt_service_rate'),
                    value: results.annualDebtServiceRate,
                    format: 'percent',
                    calc: t('table.total_annual_debt_service_rate_calc'),
                    evaluatedDisplay: format(results.annualDebtService, 'currency')
                },
                {
                    metric: t('table.monthly_mortgage_payment'),
                    value: results.monthlyMortgagePayment,
                    format: 'currency',
                    calc: t('table.monthly_mortgage_payment_calc'),
                    color: 'highlight'
                },
            ]
        },
        // III. COST OF OWNERSHIP (Owner-Occupier)
        {
            section: t('table.section_title_3'), lines: [
                {
                    metric: t('table.monthly_hausgeld'),
                    value: inputs.monthlyHausgeldFull,
                    format: 'currency',
                    calc: t('table.monthly_hausgeld_calc'),
                    isInput: true,
                    stateKey: 'monthlyHausgeldFull',
                },
                {
                    metric: t('table.monthly_rental_income'),
                    value: inputs.monthlyRentalIncome,
                    format: 'currency',
                    calc: t('table.monthly_rental_income_calc'),
                    isInput: true,
                    stateKey: 'monthlyRentalIncome',
                    inputHighlight: true,
                    color: "green"
                },
                {
                    metric: t('table.monthly_rent_payment'),
                    value: inputs.monthlyExternalRent,
                    format: 'currency',
                    calc: t('table.monthly_rent_payment_calc'),
                    isInput: true,
                    stateKey: 'monthlyExternalRent',
                    step: '10'
                },
                {
                    metric: t('table.net_monthly_expense'),
                    value: Math.abs(results.monthlyCashFlow),
                    format: 'currency',
                    calc: results.monthlyCashFlow > 0 ? t('table.net_monthly_expense_calc_in') : t('table.net_monthly_expense_calc_out'),
                    color: results.monthlyCashFlow > 0 ? 'green' : 'highlight',
                    evaluatedDisplay: format(Math.abs(results.monthlyCashFlow) * 12 * inputs.yearsToSell, 'currency'),
                    evaluatedDescription: t('table.after_years', {val: inputs.yearsToSell}),
                    isCost: true
                },
            ]
        },
        // IV. LONG-TERM PROJECTION
        {
            section: t('table.section_title_4'), lines: [
                {
                    metric: t('table.sell_property_after_years', {val: inputs.yearsToSell}),
                    value: inputs.yearsToSell,
                    format: 'number',
                    isInput: true,
                    stateKey: 'yearsToSell',
                    step: '1'
                },
                {
                    metric: t('table.annual_appreciation_rate'),
                    value: inputs.annualAppreciationRate,
                    format: 'percent',
                    calc: t('table.annual_appreciation_rate_calc'),
                    isInput: true,
                    stateKey: 'annualAppreciationRate',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.estimatedSaleValue, 'currency'),
                    evaluatedDescription: t('table.after_years', {val: inputs.yearsToSell})
                },

                {
                    metric: t('table.total_interest_paid', {val: inputs.yearsToSell}),
                    value: results.totalInterestPaid,
                    format: 'currency',
                    calc: t('table.total_interest_paid_calc'),
                    color: results.totalInterestPaid > 0 ? 'red' : undefined
                },
                {
                    metric: t('table.total_principal_paid', {val: inputs.yearsToSell}),
                    value: results.totalPrincipalPaid,
                    format: 'currency',
                    calc: t('table.total_principal_paid_calc'),
                },
                {
                    metric: t('table.loan_balance_after_years', {val: inputs.yearsToSell}),
                    value: results.loanBalanceAtSale,
                    format: 'currency',
                    calc: t('table.loan_balance_after_years_calc')
                },
                {
                    metric: t('table.total_cash_out'),
                    value: inputs.cashDownPayment + results.totalAnnualCost * inputs.yearsToSell,
                    format: 'currency',
                    calc: t('table.total_cash_out_calc'),
                    color: 'red',
                    isCost: true
                },
                {
                    metric: t('table.total_cash_lost'),
                    value: inputs.cashDownPayment + results.totalAnnualCost * inputs.yearsToSell - results.totalPrincipalPaid,
                    format: 'currency',
                    calc: t('table.total_cash_lost_calc'),
                    color: 'red',
                    isCost: true
                },
                {
                    metric: t('table.monthly_rent_avoided'),
                    value: inputs.monthlyRentAvoided,
                    format: 'currency',
                    calc: t('table.monthly_rent_avoided_calc'),
                    isInput: true,
                    stateKey: 'monthlyRentAvoided',
                    step: '10',
                    evaluatedDisplay: format(results.totalRentAvoidedPeriod, 'currency'),
                    evaluatedDescription: t('table.after_years', {val: inputs.yearsToSell}),
                    color: 'highlight'
                },
                {
                    metric: t('table.net_sale_proceeds'),
                    value: results.netSaleProceeds,
                    format: 'currency',
                    calc: t('table.net_sale_proceeds_calc'),
                    color: 'green',
                    flow: true
                },
                {
                    metric: t('table.total_net_wealth_change'),
                    value: results.netProceeds,
                    format: 'currency',
                    calc: t('table.total_net_wealth_change_calc'),
                    color: results.netProceeds > 0 ? 'green' : 'red',
                    flow: true
                },
                {
                    metric: t('table.fully_repaid_after_years'),
                    value: typeof results.repaymentYears === 'number' ? results.repaymentYears : 0,
                    format: 'number',
                    calc: t('table.fully_repaid_after_years_calc'),
                    color: 'yellow'
                },
            ]
        },
    ];
    return {renderData, results};
};
