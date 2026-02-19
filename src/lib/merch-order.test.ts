import {
	buildCartItemId,
	computeBillableByPerson,
	normalizeSelectedOptions,
	resolveOrderProductSelection,
	validateGiftCardAmount,
} from "@/lib/merch-order";
import type { Product } from "@/types/merch";
import { describe, expect, it } from "vitest";

describe("normalizeSelectedOptions", () => {
	it("drops language keys and keeps deterministic ordering", () => {
		expect(
			normalizeSelectedOptions({
				size: "m",
				language: "en",
				fit: "women",
			}),
		).toEqual({
			fit: "women",
			size: "m",
		});
	});
});

describe("buildCartItemId", () => {
	it("ignores language in cart identity", () => {
		expect(
			buildCartItemId("zip", { fit: "men", size: "l", language: "fr" }),
		).toBe(buildCartItemId("zip", { fit: "men", size: "l", language: "en" }));
	});
});

describe("resolveOrderProductSelection", () => {
	it("maps selected variant to dedicated product id and delta price", () => {
		const product: Product = {
			id: "zip",
			category: "wearables",
			price: 66,
			gradientClass: "",
			name: { en: "Zip", fr: "Zip" },
			description: { en: "", fr: "" },
			variantGroups: [
				{
					id: "fit",
					label: { en: "Fit", fr: "Coupe" },
					type: "select",
					options: [
						{
							id: "men",
							label: { en: "Men", fr: "Homme" },
							orderProductId: "zip-men",
						},
						{
							id: "women",
							label: { en: "Women", fr: "Femme" },
							orderProductId: "zip-women",
							priceDelta: 4,
						},
					],
				},
			],
		};

		expect(resolveOrderProductSelection(product, { fit: "women" })).toEqual({
			orderProductId: "zip-women",
			unitPrice: 70,
		});
	});
});

describe("computeBillableByPerson", () => {
	it("returns billable excess over company credit", () => {
		expect(computeBillableByPerson(310, 250)).toEqual({
			total: 310,
			billable: 60,
		});
	});
});

describe("validateGiftCardAmount", () => {
	it("enforces min/max boundaries", () => {
		expect(validateGiftCardAmount(24)).toBe(false);
		expect(validateGiftCardAmount(250)).toBe(true);
		expect(validateGiftCardAmount(251)).toBe(false);
	});
});
