export interface SimulationInput {
    purchasePrice: number;
    renovationBudget: number;
    cashDownPayment: number;
    taxTransfer: number;
    taxNotary: number;
    taxBroker: number;
    interestRate: number;
    amortizationRate: number;
    propertySizeSqm: number;
    monthlyHausgeldFull: number;
    monthlyRentalIncome: number;
    monthlyExternalRent: number;
    monthlyRentAvoided: number;
    yearsToSell: number;
    annualAppreciationRate: number;
    fixedRateYears: number;
    rateAfterFixed: number;
    monthlyMaintenanceReserve: number;
    specialLevies: number;
    sellingCostRate: number;
    investmentReturnRate: number;
    rentGrowthRate: number;
    costGrowthRate: number;
    investmentTaxRate: number;
    capitalGainsTaxRate: number;
    monthlyPropertyTax: number;
    vacancyRate: number;
    renovationValueShare: number;
    annualExtraRepayment: number;
}

export interface SimulationResult {
    transferTax: number;
    notaryAndLandRegistryCost: number;
    brokerCommission: number;
    totalTransactionCosts: number;
    totalInvestmentBase: number;
    totalProjectCost: number;
    totalInitialOutlay: number;
    netEquityAppliedToAsset: number;
    loanRequired: number;
    annualDebtServiceRate: number;
    annualDebtService: number;
    monthlyMortgagePayment: number;
    firstMonthInterest: number;
    firstMonthPrincipal: number;
    annualHausgeldFull: number;
    annualRentalIncome: number;
    annualExternalRent: number;
    totalAnnualRunningCost: number;
    totalAnnualCost: number;
    annualCashFlow: number;
    monthlyCashFlow: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
    loanBalanceAtSale: number;
    repaymentYears: number | string;
    estimatedSaleValue: number;
    totalRunningCostPeriod: number;
    totalRentalIncomePeriod: number;
    totalExternalRentPeriod: number;
    totalRentAvoidedPeriod: number;
    totalCashOut: number;
    netSaleProceeds: number;
    netProceeds: number;
    amortizationSchedule: AmortizationData[];
    annualMaintenanceReserve: number;
    balanceAtFixedEnd: number;
    monthlyPaymentAfterFixed: number;
    totalDebtServicePeriod: number;
    totalCashLost: number;
    sellingCosts: number;
    netProceedsWithRent: number;
    buyVsInvest: number;
    loanToValue: number;
    monthlyRunningCost: number;
    totalExtraRepaid: number;
    capitalGainsTax: number;
    renterPortfolioBeforeTax: number;
    renterInvestmentTax: number;
    renterWealth: number;
    ownerWealth: number;
}

export interface AmortizationData {
    month: number;
    interest: number;
    principal: number;
    remainingBalance: number;
}

export interface RenderData {
    section: string;
    lines: RenderLine[];
}

export interface RenderLine {
    metric: string;
    value: number;
    format: 'currency' | 'percent' | 'm²' | 'number';
    calc?: string;
    isInput?: boolean;
    stateKey?: keyof SimulationInput;
    isPercent?: boolean;
    inputHighlight?: boolean;
    highlight?: boolean;
    step?: string;
    isCost?: boolean;
    flow?: boolean;
    evaluatedDescription?: string;
    evaluatedDisplay?: string;
    displayText?: string;
    color?: 'highlight' | 'red' | 'green' | 'yellow';
}
