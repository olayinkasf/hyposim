
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
    desiredMonthlyCost: number;
    monthlyExternalRent: number;
    yearsToSell: number;
    annualAppreciationRate: number;
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
    totalCashOut: number;
    netSaleProceeds: number;
    netProceeds: number;
    amortizationSchedule: AmortizationData[];
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
    L: number;
    metric: string;
    value: number;
    format: 'currency' | 'percent' | 'm²' | 'number';
    calc: string;
    isInput?: boolean;
    stateKey?: keyof SimulationInput;
    isPercent?: boolean;
    inputHighlight?: boolean;
    highlight?: boolean;
    step?: string;
    isCost?: boolean;
    flow?: boolean;
    evaluatedDisplay?: string;
}
