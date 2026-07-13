// format currency to PHP
export const formatCurrency = (value: number, currency = 'PHP', locale = 'en-PH') => {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(value);
};

// format currency without currency symbol with two decimal places
export const formatCurrencyNoSymbol = (value: number, locale = 'en-PH') => {
	return new Intl.NumberFormat(locale, {
		style: 'decimal',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
};

export const stringToDecimal = (value: any) => {
	if (typeof value !== 'string') return value;
	return parseFloat(value.replace(/,/g, ''));
};
