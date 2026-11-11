const PRICE_WITH_TAXES_PER_100_000 = 114975;
const CENTS_PER_DOLLAR = 100;

export const getPriceWithTaxes = (cost: number) =>
	Math.ceil(
		(Math.round(cost * CENTS_PER_DOLLAR) * PRICE_WITH_TAXES_PER_100_000) /
			(100000 * CENTS_PER_DOLLAR),
	);
