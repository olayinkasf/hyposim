
// --- FORMATTER FUNCTIONS ---
const currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const percentFormatter = new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 2 });
const numberFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2 });

export const format = (value: number, type: 'currency' | 'percent' | 'm²' | 'number' = 'currency'): string => {
    if (isNaN(value) || value === null || value === undefined) return type === 'currency' ? '€0.00' : '0.00%';
    if (type === 'currency') return currencyFormatter.format(value);
    if (type === 'percent') return percentFormatter.format(value);
    if (type === 'm²') return `${numberFormatter.format(value)} m²`;
    if (type === 'number') return numberFormatter.format(value);
    return String(value);
};
