import type { Product } from "@/types/merch";

export const GIFT_CARD_DEFAULT_AMOUNT = 250;
export const GIFT_CARD_MIN_AMOUNT = 25;
export const GIFT_CARD_MAX_AMOUNT = 250;

const LANGUAGE_OPTION_KEYS = new Set(["language", "lang", "locale", "langue"]);

const normalizeOptionKey = (key: string) => key.trim().toLowerCase();

export const isLanguageOptionKey = (key: string) =>
	LANGUAGE_OPTION_KEYS.has(normalizeOptionKey(key));

export const normalizeSelectedOptions = (
	selectedOptions: Record<string, string>,
) =>
	Object.fromEntries(
		Object.entries(selectedOptions)
			.filter(
				([key, value]) =>
					!isLanguageOptionKey(key) &&
					typeof value === "string" &&
					value.length > 0,
			)
			.sort(([left], [right]) => left.localeCompare(right)),
	);

export const buildCartItemId = (
	productId: string,
	selectedOptions: Record<string, string>,
) => {
	const optionKey = Object.entries(normalizeSelectedOptions(selectedOptions))
		.map(([key, value]) => `${key}:${value}`)
		.join("|");
	return `${productId}::${optionKey}`;
};

export const resolveOrderProductSelection = (
	product: Product,
	selectedOptions: Record<string, string>,
) => {
	let orderProductId = product.id;
	let unitPrice = product.price;

	for (const group of product.variantGroups ?? []) {
		const selectedOptionId = selectedOptions[group.id];
		if (!selectedOptionId) {
			continue;
		}

		const selectedOption = group.options.find(
			(option) => option.id === selectedOptionId,
		);
		if (!selectedOption) {
			continue;
		}

		if (selectedOption.orderProductId) {
			orderProductId = selectedOption.orderProductId;
		}
		if (typeof selectedOption.priceDelta === "number") {
			unitPrice += selectedOption.priceDelta;
		}
	}

	return {
		orderProductId,
		unitPrice: Math.max(0, unitPrice),
	};
};

export const findProductByOrderProductId = (
	products: Product[],
	orderProductId: string,
	selectedOptions: Record<string, string>,
) => {
	const exact = products.find((candidate) => candidate.id === orderProductId);
	if (exact) {
		return exact;
	}

	return (
		products.find((candidate) =>
			(candidate.variantGroups ?? []).some((group) => {
				const selectedOptionId = selectedOptions[group.id];
				return group.options.some(
					(option) =>
						option.id === selectedOptionId &&
						option.orderProductId === orderProductId,
				);
			}),
		) ?? null
	);
};

export const computeBillableByPerson = (
	subtotal: number,
	companyCredit: number,
) => {
	const total = Number.isFinite(subtotal) ? subtotal : 0;
	const billable = Math.max(total - companyCredit, 0);
	return { total, billable };
};

export const validateGiftCardAmount = (
	amount: number,
	min = GIFT_CARD_MIN_AMOUNT,
	max = GIFT_CARD_MAX_AMOUNT,
) => amount >= min && amount <= max;
