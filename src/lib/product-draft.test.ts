import { describe, expect, it } from "vitest";

import {
	createGroupDraft,
	createImageDraft,
	createProductDraft,
	toDuplicateDraft,
	toProduct,
	toProductDraft,
	validateProductDraft,
} from "@/lib/product-draft";
import type { Product } from "@/types/merch";

const bottle: Product = {
	id: "bottle",
	category: "lifestyle",
	price: 40,
	supplier: "Yeti",
	supplierUrl: "https://www.yeti.ca/bottle",
	cost: 34.5,
	isActive: true,
	sortOrder: 30,
	images: [
		{ src: "/merch/bottle-black.png", when: { color: "black" } },
		{ src: "/merch/bottle-logo.png", when: { color: "black", visual: "logo" } },
		{ src: "/merch/bottle.png" },
	],
	name: { fr: "Bouteille", en: "Bottle" },
	description: { fr: "Une bouteille.", en: "Une bouteille." },
	variantGroups: [
		{
			id: "color",
			label: { fr: "Couleur", en: "Color" },
			type: "color",
			options: [
				{
					id: "black",
					label: { fr: "Noir", en: "Black" },
					swatchHex: "#1F1F1F",
					orderProductId: "bottle-black",
					supplierLabel: "Black",
				},
			],
		},
		{
			id: "size",
			label: { fr: "Taille", en: "Size" },
			type: "size",
			options: [
				{ id: "s", label: { fr: "S", en: "S" } },
				{ id: "l", label: { fr: "L", en: "L" }, priceDelta: 5 },
			],
		},
	],
};

describe("toProductDraft and toProduct", () => {
	it("round-trips a product without losing anything", () => {
		expect(toProduct(toProductDraft(bottle), new Map())).toEqual(bottle);
	});

	it("builds ids from the labels of new options", () => {
		const draft = createProductDraft([bottle]);
		draft.id = "tuque";
		draft.nameFr = "Tuque";
		draft.price = "23";
		const colors = createGroupDraft("color");
		colors.options[0].labelFr = "Orange brûlé";
		draft.groups.push(colors);
		const image = createImageDraft({ src: "", file: null, previewUrl: "" });
		image.optionKey = colors.options[0].key;
		draft.images.push(image);

		const product = toProduct(draft, new Map([[image.key, "db:abc"]]));

		expect(product.sortOrder).toBe(40);
		expect(product.supplier).toBeNull();
		expect(product.cost).toBeNull();
		expect(product.variantGroups?.[0].options[0]).toEqual({
			id: "orange-brule",
			label: { fr: "Orange brûlé", en: "Orange brûlé" },
			swatchHex: "#1F1F1F",
		});
		expect(product.images).toEqual([
			{ src: "db:abc", when: { color: "orange-brule" } },
		]);
	});
});

describe("toDuplicateDraft", () => {
	it("gives the copy its own identifier, name and position", () => {
		const copy = toDuplicateDraft(bottle, [bottle]);
		expect(copy.id).toBe("bottle-copie");
		expect(copy.nameFr).toBe("Bouteille (copie)");
		expect(copy.sortOrder).toBe(40);
		expect(copy.groups).toHaveLength(2);
	});

	it("skips identifiers that are already used", () => {
		const firstCopy = { ...bottle, id: "bottle-copie" };
		expect(toDuplicateDraft(bottle, [bottle, firstCopy]).id).toBe(
			"bottle-copie-2",
		);
	});
});

describe("validateProductDraft", () => {
	it("accepts a valid product", () => {
		expect(validateProductDraft(toProductDraft(bottle), [], false)).toEqual([]);
	});

	it("requires a name, a valid identifier and a price", () => {
		const errors = validateProductDraft(createProductDraft([]), [], true);
		expect(errors).toHaveLength(3);
	});

	it("refuses an identifier that is already used", () => {
		const draft = toProductDraft(bottle);
		expect(validateProductDraft(draft, ["bottle"], true)).toEqual([
			"Cet identifiant est déjà utilisé par un autre article.",
		]);
		expect(validateProductDraft(draft, ["bottle"], false)).toEqual([]);
	});

	it("refuses an invalid cost or supplier link", () => {
		const draft = toProductDraft(bottle);
		draft.cost = "-1";
		draft.supplierUrl = "yeti.ca/bottle";
		expect(validateProductDraft(draft, [], false)).toEqual([
			"Le coût doit être un nombre positif.",
			"Le lien du fournisseur doit commencer par https://.",
		]);
	});

	it("refuses duplicate and unnamed choices", () => {
		const draft = toProductDraft(bottle);
		const sizes = draft.groups[1];
		sizes.options.push({ ...sizes.options[0], key: "copy", id: "" });
		sizes.options.push({
			...sizes.options[0],
			key: "empty",
			id: "",
			labelFr: "",
		});
		expect(validateProductDraft(draft, [], false)).toEqual([
			"« Taille »: le choix « S » est en double.",
			"« Taille »: chaque choix doit avoir un nom.",
		]);
	});
});
