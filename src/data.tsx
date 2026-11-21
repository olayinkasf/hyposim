import type { TFunction } from 'i18next';
import type {SimulationInput, SimulationResult, RenderData, AmortizationData} from './types';
import {format} from './formatters';

export const calculateSimulation = (inputs: SimulationInput): SimulationResult => {
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
    results.loanToValue = results.loanRequired / (inputs.purchasePrice || 1);
    // Debt service during the fixed-rate period
    results.annualDebtServiceRate = inputs.interestRate + inputs.amortizationRate;
    results.annualDebtService = results.loanRequired * results.annualDebtServiceRate;
    results.monthlyMortgagePayment = results.annualDebtService / 12;
    results.firstMonthInterest = results.loanRequired * inputs.interestRate / 12;
    results.firstMonthPrincipal = results.monthlyMortgagePayment - results.firstMonthInterest;
    // 4. Running costs in year 1 (Hausgeld + own upkeep + Grundsteuer)
    results.annualHausgeldFull = inputs.monthlyHausgeldFull * 12;
    results.annualMaintenanceReserve = inputs.monthlyMaintenanceReserve * 12;
    results.annualRentalIncome = inputs.monthlyRentalIncome * (1 - inputs.vacancyRate) * 12;
    results.annualExternalRent = inputs.monthlyExternalRent * 12;
    results.monthlyRunningCost = inputs.monthlyHausgeldFull + inputs.monthlyMaintenanceReserve + inputs.monthlyPropertyTax;
    results.totalAnnualRunningCost = results.monthlyRunningCost * 12;
    results.totalAnnualCost = results.annualDebtService + results.totalAnnualRunningCost - results.annualRentalIncome + results.annualExternalRent;
    results.annualCashFlow = -results.totalAnnualCost;
    results.monthlyCashFlow = results.annualCashFlow / 12;

    // 5. Month-by-month: loan (with rate change + extra repayments), growing costs/rents,
    //    and a renter who invests the down payment plus any monthly difference.
    const monthsToSell = Math.round(inputs.yearsToSell * 12);
    const fixedMonths = Math.round(inputs.fixedRateYears * 12);
    const monthlyReturn = Math.pow(1 + inputs.investmentReturnRate, 1 / 12) - 1;
    const leviesMonth = Math.max(1, Math.round(monthsToSell / 2));
    let balance = results.loanRequired;
    let payment = fixedMonths === 0 ? balance * (inputs.rateAfterFixed + inputs.amortizationRate) / 12 : results.monthlyMortgagePayment;
    results.monthlyPaymentAfterFixed = fixedMonths === 0 ? payment : 0;
    results.balanceAtFixedEnd = fixedMonths === 0 ? balance : 0;
    results.loanBalanceAtSale = balance;
    let totalInterestPaid = 0, totalPrincipalPaid = 0, totalExtraRepaid = 0, monthsToRepay = 0;
    let runningPeriod = 0, rentalPeriod = 0, externalRentPeriod = 0, rentAvoidedPeriod = 0;
    let renterPortfolio = inputs.cashDownPayment;
    let renterContributions = inputs.cashDownPayment;
    const schedule: AmortizationData[] = [];
    const lastMonth = Math.max(monthsToSell, 12 * 100);
    for (let month = 1; month <= lastMonth; month++) {
        const inPeriod = month <= monthsToSell;
        if (balance <= 0.005 && !inPeriod) break;
        if (month === fixedMonths + 1 && balance > 0.005) {
            results.balanceAtFixedEnd = balance;
            payment = balance * (inputs.rateAfterFixed + inputs.amortizationRate) / 12;
            results.monthlyPaymentAfterFixed = payment;
        }
        let loanCashThisMonth = 0;
        if (balance > 0.005) {
            const rate = month <= fixedMonths ? inputs.interestRate : inputs.rateAfterFixed;
            const interest = balance * rate / 12;
            let principal = Math.min(payment - interest, balance);
            if (principal <= 0 && month > 600) break; // payment never covers interest
            balance -= principal;
            let extra = 0;
            if (month % 12 === 0 && inputs.annualExtraRepayment > 0 && balance > 0) {
                extra = Math.min(inputs.annualExtraRepayment, balance);
                balance -= extra;
            }
            principal += extra;
            loanCashThisMonth = interest + principal;
            if (inPeriod) {
                totalInterestPaid += interest;
                totalPrincipalPaid += principal;
                totalExtraRepaid += extra;
                schedule.push({month, interest, principal, remainingBalance: balance});
                results.loanBalanceAtSale = balance;
            }
            if (balance <= 0.005) { balance = 0; monthsToRepay = month; }
        }
        if (inPeriod) {
            const year = Math.floor((month - 1) / 12);
            const costFactor = Math.pow(1 + inputs.costGrowthRate, year);
            const rentFactor = Math.pow(1 + inputs.rentGrowthRate, year);
            const running = results.monthlyRunningCost * costFactor + (month === leviesMonth ? inputs.specialLevies : 0);
            const rental = inputs.monthlyRentalIncome * (1 - inputs.vacancyRate) * rentFactor;
            const external = inputs.monthlyExternalRent * rentFactor;
            const rentAvoided = inputs.monthlyRentAvoided * rentFactor;
            runningPeriod += running;
            rentalPeriod += rental;
            externalRentPeriod += external;
            rentAvoidedPeriod += rentAvoided;
            // Same money leaves your pocket in both cases. The renter pays rent and invests the rest.
            const ownerOutflow = loanCashThisMonth + running + external - rental;
            const difference = ownerOutflow - rentAvoided;
            renterPortfolio = renterPortfolio * (1 + monthlyReturn) + difference;
            renterContributions += difference;
        }
    }
    results.totalInterestPaid = totalInterestPaid;
    results.totalPrincipalPaid = totalPrincipalPaid;
    results.totalExtraRepaid = totalExtraRepaid;
    results.amortizationSchedule = schedule;
    results.repaymentYears = results.loanRequired === 0 ? 0 : monthsToRepay > 0 ? monthsToRepay / 12 : 'N/A';

    // 6. Holding period totals
    results.totalDebtServicePeriod = totalInterestPaid + totalPrincipalPaid;
    results.totalRunningCostPeriod = runningPeriod;
    results.totalRentalIncomePeriod = rentalPeriod;
    results.totalExternalRentPeriod = externalRentPeriod;
    results.totalRentAvoidedPeriod = rentAvoidedPeriod;
    results.totalCashOut = inputs.cashDownPayment + results.totalDebtServicePeriod + runningPeriod - rentalPeriod + externalRentPeriod;
    results.totalCashLost = results.totalCashOut - totalPrincipalPaid;

    // 7. Sale (renovation adds part of its cost to the value)
    const valueBase = inputs.purchasePrice + inputs.renovationBudget * inputs.renovationValueShare;
    results.estimatedSaleValue = valueBase * Math.pow(1 + inputs.annualAppreciationRate, inputs.yearsToSell);
    results.sellingCosts = results.estimatedSaleValue * inputs.sellingCostRate;
    // Capital gains tax only applies when selling within 10 years (and not self-used: user sets rate to 0 then)
    const taxableGain = results.estimatedSaleValue - results.sellingCosts - results.totalProjectCost;
    results.capitalGainsTax = inputs.yearsToSell < 10 ? Math.max(0, taxableGain) * inputs.capitalGainsTaxRate : 0;
    results.netSaleProceeds = results.estimatedSaleValue - results.sellingCosts - results.loanBalanceAtSale - results.capitalGainsTax;
    results.netProceeds = results.netSaleProceeds - results.totalCashOut;
    results.netProceedsWithRent = results.netProceeds + rentAvoidedPeriod;

    // 8. Rent & invest instead
    results.renterPortfolioBeforeTax = renterPortfolio;
    results.renterInvestmentTax = Math.max(0, renterPortfolio - renterContributions) * inputs.investmentTaxRate;
    results.renterWealth = renterPortfolio - results.renterInvestmentTax;
    results.ownerWealth = results.netSaleProceeds;
    results.buyVsInvest = results.ownerWealth - results.renterWealth;
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
                    metric: t('table.renovation_value_share'),
                    value: inputs.renovationValueShare,
                    format: 'percent',
                    calc: t('table.renovation_value_share_calc'),
                    isInput: true,
                    stateKey: 'renovationValueShare',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(inputs.renovationBudget * inputs.renovationValueShare, 'currency')
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
                    metric: t('table.cash_after_buying_costs'),
                    value: results.netEquityAppliedToAsset,
                    format: 'currency',
                    calc: results.netEquityAppliedToAsset < 0 ? t('table.cash_after_buying_costs_warn') : t('table.cash_after_buying_costs_ok', {val: format(results.loanToValue, 'percent')}),
                    color: results.netEquityAppliedToAsset < 0 ? 'red' : 'green'
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
                    metric: t('table.extra_repayment'),
                    value: inputs.annualExtraRepayment,
                    format: 'currency',
                    calc: t('table.extra_repayment_calc', {val: format(results.loanRequired * 0.05, 'currency')}),
                    isInput: true,
                    stateKey: 'annualExtraRepayment',
                    step: '1000'
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
                    metric: t('table.property_tax'),
                    value: inputs.monthlyPropertyTax,
                    format: 'currency',
                    calc: t('table.property_tax_calc'),
                    isInput: true,
                    stateKey: 'monthlyPropertyTax',
                    inputHighlight: true,
                    step: '5'
                },
                {
                    metric: t('table.cost_growth'),
                    value: inputs.costGrowthRate,
                    format: 'percent',
                    calc: t('table.cost_growth_calc'),
                    isInput: true,
                    stateKey: 'costGrowthRate',
                    isPercent: true,
                    inputHighlight: true
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
                    metric: t('table.vacancy_rate'),
                    value: inputs.vacancyRate,
                    format: 'percent',
                    calc: t('table.vacancy_rate_calc'),
                    isInput: true,
                    stateKey: 'vacancyRate',
                    isPercent: true,
                    inputHighlight: true
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
                    metric: t('table.rent_growth'),
                    value: inputs.rentGrowthRate,
                    format: 'percent',
                    calc: t('table.rent_growth_calc'),
                    isInput: true,
                    stateKey: 'rentGrowthRate',
                    isPercent: true,
                    inputHighlight: true
                },
                {
                    metric: t('table.net_monthly_expense'),
                    value: Math.abs(results.monthlyCashFlow),
                    format: 'currency',
                    calc: results.monthlyCashFlow > 0 ? t('table.net_monthly_expense_calc_in') : t('table.net_monthly_expense_calc_out'),
                    color: results.monthlyCashFlow > 0 ? 'green' : 'highlight',
                    evaluatedDisplay: format(results.totalCashOut - inputs.cashDownPayment, 'currency'),
                    evaluatedDescription: t('table.after_years_growth', {val: inputs.yearsToSell}),
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
                    metric: t('table.capital_gains_tax'),
                    value: inputs.capitalGainsTaxRate,
                    format: 'percent',
                    calc: inputs.yearsToSell < 10 ? t('table.capital_gains_tax_calc') : t('table.capital_gains_tax_calc_free'),
                    isInput: true,
                    stateKey: 'capitalGainsTaxRate',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.capitalGainsTax, 'currency'),
                    color: results.capitalGainsTax > 0 ? 'red' : undefined
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
                    evaluatedDisplay: format(results.renterPortfolioBeforeTax, 'currency'),
                    evaluatedDescription: t('table.after_years', {val: inputs.yearsToSell})
                },
                {
                    metric: t('table.investment_tax_rate'),
                    value: inputs.investmentTaxRate,
                    format: 'percent',
                    calc: t('table.investment_tax_rate_calc'),
                    isInput: true,
                    stateKey: 'investmentTaxRate',
                    isPercent: true,
                    inputHighlight: true,
                    evaluatedDisplay: format(results.renterInvestmentTax, 'currency'),
                    color: 'red'
                },
                {
                    metric: t('table.renter_wealth', {val: inputs.yearsToSell}),
                    value: results.renterWealth,
                    format: 'currency',
                    calc: inputs.monthlyRentAvoided > 0 ? t('table.renter_wealth_calc') : t('table.renter_wealth_calc_norent'),
                    color: inputs.monthlyRentAvoided > 0 ? 'highlight' : 'yellow'
                },
                {
                    metric: t('table.owner_wealth', {val: inputs.yearsToSell}),
                    value: results.ownerWealth,
                    format: 'currency',
                    calc: t('table.owner_wealth_calc'),
                    color: 'highlight'
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
                    displayText: typeof results.repaymentYears === 'number'
                        ? t('table.years_months', {y: Math.floor(results.repaymentYears), m: Math.round((results.repaymentYears % 1) * 12)})
                        : t('table.never_repaid'),
                    calc: t('table.fully_repaid_after_years_calc'),
                    color: 'yellow'
                },
            ]
        },
    ];
    return {renderData, results};
};
