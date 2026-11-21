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
    // 2. Total Project Cost
    results.totalInvestmentBase = inputs.purchasePrice + inputs.renovationBudget;
    results.totalProjectCost = results.totalInvestmentBase + results.totalTransactionCosts;
    // 3. Initial Outlay & Financing
    results.totalInitialOutlay = inputs.cashDownPayment;
    results.netEquityAppliedToAsset = inputs.cashDownPayment - results.totalTransactionCosts;
    results.loanRequired = Math.max(0, results.totalProjectCost - inputs.cashDownPayment);
    // Debt service during the fixed-rate period
    results.annualDebtServiceRate = inputs.interestRate + inputs.amortizationRate;
    results.annualDebtService = results.loanRequired * results.annualDebtServiceRate;
    results.monthlyMortgagePayment = results.annualDebtService / 12;
    results.firstMonthInterest = results.loanRequired * inputs.interestRate / 12;
    results.firstMonthPrincipal = results.monthlyMortgagePayment - results.firstMonthInterest;
    // 4. Running costs (Hausgeld + own upkeep reserve)
    results.annualHausgeldFull = inputs.monthlyHausgeldFull * 12;
    results.annualMaintenanceReserve = inputs.monthlyMaintenanceReserve * 12;
    results.annualRentalIncome = inputs.monthlyRentalIncome * 12;
    results.annualExternalRent = inputs.monthlyExternalRent * 12;
    results.totalAnnualRunningCost = results.annualHausgeldFull + results.annualMaintenanceReserve;
    results.totalAnnualCost = results.annualDebtService + results.totalAnnualRunningCost - results.annualRentalIncome + results.annualExternalRent;
    results.annualCashFlow = -results.totalAnnualCost;
    results.monthlyCashFlow = results.annualCashFlow / 12;

    // 5. Amortization with a rate change after the fixed period (Anschlussfinanzierung).
    // After the fixed period the bank sets a new payment: remaining balance x (new rate + same repayment rate).
    const monthsToSell = Math.round(inputs.yearsToSell * 12);
    const fixedMonths = Math.round(inputs.fixedRateYears * 12);
    let balance = results.loanRequired;
    let payment = results.monthlyMortgagePayment;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    let monthsToRepay = 0;
    results.balanceAtFixedEnd = fixedMonths === 0 ? balance : 0;
    results.monthlyPaymentAfterFixed = fixedMonths === 0 ? balance * (inputs.rateAfterFixed + inputs.amortizationRate) / 12 : 0;
    if (fixedMonths === 0) payment = results.monthlyPaymentAfterFixed;
    results.loanBalanceAtSale = balance;
    const schedule: AmortizationData[] = [];
    for (let month = 1; balance > 0.005 && month <= Math.max(monthsToSell, 12 * 100); month++) {
        if (month === fixedMonths + 1) {
            results.balanceAtFixedEnd = balance;
            payment = balance * (inputs.rateAfterFixed + inputs.amortizationRate) / 12;
            results.monthlyPaymentAfterFixed = payment;
        }
        const rate = month <= fixedMonths ? inputs.interestRate : inputs.rateAfterFixed;
        const interest = balance * rate / 12;
        let principal = payment - interest;
        if (principal <= 0 && month > 600) break; // payment never covers interest
        if (principal > balance) principal = balance;
        balance -= principal;
        if (month <= monthsToSell) {
            totalInterestPaid += interest;
            totalPrincipalPaid += principal;
            schedule.push({month, interest, principal, remainingBalance: balance});
            results.loanBalanceAtSale = balance;
        }
        if (balance <= 0.005) monthsToRepay = month;
    }
    results.totalInterestPaid = totalInterestPaid;
    results.totalPrincipalPaid = totalPrincipalPaid;
    results.amortizationSchedule = schedule;
    results.repaymentYears = results.loanRequired === 0 ? 0 : monthsToRepay > 0 ? monthsToRepay / 12 : 'N/A';

    // 6. Holding period totals
    const years = inputs.yearsToSell;
    results.totalDebtServicePeriod = totalInterestPaid + totalPrincipalPaid;
    results.totalRunningCostPeriod = results.totalAnnualRunningCost * years + inputs.specialLevies;
    results.totalRentalIncomePeriod = results.annualRentalIncome * years;
    results.totalExternalRentPeriod = results.annualExternalRent * years;
    results.totalRentAvoidedPeriod = inputs.monthlyRentAvoided * 12 * years;
    results.totalCashOut = inputs.cashDownPayment + results.totalDebtServicePeriod + results.totalRunningCostPeriod
        - results.totalRentalIncomePeriod + results.totalExternalRentPeriod;
    results.totalCashLost = results.totalCashOut - totalPrincipalPaid;

    // 7. Sale
    results.estimatedSaleValue = inputs.purchasePrice * Math.pow(1 + inputs.annualAppreciationRate, years);
    results.sellingCosts = results.estimatedSaleValue * inputs.sellingCostRate;
    results.netSaleProceeds = results.estimatedSaleValue - results.sellingCosts - results.loanBalanceAtSale;
    results.netProceeds = results.netSaleProceeds - results.totalCashOut;
    results.netProceedsWithRent = results.netProceeds + results.totalRentAvoidedPeriod;

    // 8. Opportunity cost: the down payment invested instead
    results.downPaymentInvestedValue = inputs.cashDownPayment * Math.pow(1 + inputs.investmentReturnRate, years);
    results.investingGainForgone = results.downPaymentInvestedValue - inputs.cashDownPayment;
    results.buyVsInvest = results.netProceedsWithRent - results.investingGainForgone;
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
                {
                    metric: t('table.fixed_rate_years'),
                    value: inputs.fixedRateYears,
                    format: 'number',
                    calc: t('table.fixed_rate_years_calc'),
                    isInput: true,
                    stateKey: 'fixedRateYears',
                    step: '1'
                },
                {
                    metric: t('table.loan_balance_fixed_end', {val: inputs.fixedRateYears}),
                    value: results.balanceAtFixedEnd,
                    format: 'currency',
                    calc: t('table.loan_balance_fixed_end_calc')
                },
                {
                    metric: t('table.rate_after_fixed'),
                    value: inputs.rateAfterFixed,
                    format: 'percent',
                    calc: t('table.rate_after_fixed_calc'),
                    isInput: true,
                    stateKey: 'rateAfterFixed',
                    isPercent: true,
                    inputHighlight: true
                },
                {
                    metric: t('table.payment_after_fixed'),
                    value: results.monthlyPaymentAfterFixed,
                    format: 'currency',
                    calc: t('table.payment_after_fixed_calc', {val: format(results.monthlyPaymentAfterFixed - results.monthlyMortgagePayment, 'currency')}),
                    color: results.monthlyPaymentAfterFixed > results.monthlyMortgagePayment ? 'red' : 'highlight'
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
                    metric: t('table.maintenance_reserve'),
                    value: inputs.monthlyMaintenanceReserve,
                    format: 'currency',
                    calc: t('table.maintenance_reserve_calc', {val: format(inputs.monthlyMaintenanceReserve / (inputs.propertySizeSqm || 1), 'currency')}),
                    isInput: true,
                    stateKey: 'monthlyMaintenanceReserve',
                    inputHighlight: true,
                    step: '10'
                },
                {
                    metric: t('table.special_levies'),
                    value: inputs.specialLevies,
                    format: 'currency',
                    calc: t('table.special_levies_calc'),
                    isInput: true,
                    stateKey: 'specialLevies',
                    inputHighlight: true,
                    step: '1000'
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
                    value: results.totalCashOut,
                    format: 'currency',
                    calc: t('table.total_cash_out_calc'),
                    color: 'red',
                    isCost: true
                },
                {
                    metric: t('table.total_cash_lost'),
                    value: results.totalCashLost,
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
                    metric: t('table.selling_cost_rate'),
                    value: inputs.sellingCostRate,
                    format: 'percent',
                    calc: t('table.selling_cost_rate_calc'),
                    isInput: true,
                    stateKey: 'sellingCostRate',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.sellingCosts, 'currency'),
                    color: 'red'
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
                    metric: t('table.net_with_rent_avoided'),
                    value: results.netProceedsWithRent,
                    format: 'currency',
                    calc: t('table.net_with_rent_avoided_calc'),
                    color: results.netProceedsWithRent > 0 ? 'green' : 'red'
                },
                {
                    metric: t('table.investment_return_rate'),
                    value: inputs.investmentReturnRate,
                    format: 'percent',
                    calc: t('table.investment_return_rate_calc'),
                    isInput: true,
                    stateKey: 'investmentReturnRate',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.downPaymentInvestedValue, 'currency'),
                    evaluatedDescription: t('table.after_years', {val: inputs.yearsToSell})
                },
                {
                    metric: t('table.investing_gain_forgone'),
                    value: results.investingGainForgone,
                    format: 'currency',
                    calc: t('table.investing_gain_forgone_calc'),
                    color: 'red',
                    isCost: true
                },
                {
                    metric: t('table.buy_vs_invest'),
                    value: results.buyVsInvest,
                    format: 'currency',
                    calc: results.buyVsInvest >= 0 ? t('table.buy_vs_invest_calc_win') : t('table.buy_vs_invest_calc_lose'),
                    color: results.buyVsInvest >= 0 ? 'green' : 'red',
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
