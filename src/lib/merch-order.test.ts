import {
	buildCartItemId,
	computeBillableByPerson,
	normalizeSelectedOptions,
	resolveOrderProductSelection,
	toCartItem,
	toOrderLineView,
	validateGiftCardAmount,
} from "@/lib/merch-order";
import type { StoredOrderItem } from "@/lib/order-repository";
import type { Product } from "@/types/merch";
import { describe, expect, it } from "vitest";

const hoodie: Product = {
	id: "hoodie",
	category: "wearables",
	price: 65,
	supplier: null,
	supplierUrl: null,
	cost: null,
	isActive: false,
	sortOrder: 10,
	images: [{ src: "/merch/hoodie-noir.png", when: { color: "black" } }],
	name: { en: "Hoodie", fr: "Hoodie" },
	description: { en: "", fr: "" },
	variantGroups: [
		{
			id: "color",
			label: { en: "Color", fr: "Couleur" },
			type: "color",
			options: [
				{
					id: "black",
					label: { en: "Black", fr: "Noir" },
					swatchHex: "#1F1F1F",
					orderProductId: "black-hoodie",
				},
			],
		},
	],
};

const storedItem: StoredOrderItem = {
	id: "item-1",
	cartLineId: "black-hoodie::size:m",
	productId: "black-hoodie",
	productName: "Hoodie noir",
	quantity: 2,
	lineTotal: 130,
	selectedOptions: { size: "m" },
};

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
			supplier: "Printeez",
			supplierUrl: null,
			cost: null,
			isActive: true,
			sortOrder: 10,
			images: [],
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

describe("toCartItem", () => {
	it("maps a stored variant id back to its catalog product and option", () => {
		expect(toCartItem(storedItem, [hoodie])).toEqual({
			id: buildCartItemId("hoodie", { color: "black", size: "m" }),
			productId: "hoodie",
			quantity: 2,
			selectedOptions: { color: "black", size: "m" },
			selectedOptionLabels: undefined,
		});
	});
});

describe("toOrderLineView", () => {
	it("keeps the stored total and reads the product from the catalog", () => {
		const line = toOrderLineView(storedItem, [hoodie]);
		expect(line.lineTotal).toBe(130);
		expect(line.selectedOptions).toEqual({ color: "black", size: "m" });
		expect(line.product.id).toBe("hoodie");
		expect(line.product.supplier).toBeNull();
	});

	it("falls back to the stored name when the product is gone", () => {
		const line = toOrderLineView(storedItem, []);
		expect(line.product.id).toBeUndefined();
		expect(line.product.name.fr).toBe("Hoodie noir");
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
