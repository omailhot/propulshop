import { describe, expect, it } from "vitest";

import { products } from "@/config/merch-store";
import { renderMarkdown, markdownToPlainText } from "@/lib/markdown";
import {
	findProductByOrderProductId,
	resolveOrderProductSelection,
	withImpliedOptions,
} from "@/lib/merch-order";
import { buildCatalog } from "@/lib/product-catalog";
import { parseProductMarkdown } from "@/lib/product-content";
import { getImagesForSelection } from "@/lib/product-images";

const HOODIE = `---
name: Hoodie
category: wearables
price: 65
supplier: printeez
order: 10
colors:
  - id: black
    name: Noir
    name_en: Black
    hex: "#1f1f1f"
    sku: black-hoodie
    images:
      - /merch/hoodie-noir.png
  - id: beige
    name: Beige
    hex: "#D8C8AE"
    sku: beige-hoodie
    images:
      - /merch/hoodie-beige.png
sizes: [S, M, L]
images:
  - /merch/size-guide.png
---

Un **hoodie** doux.

- Coton
- Poche kangourou
`;

describe("parseProductMarkdown", () => {
	it("turns one file with colors into one product with swatches", () => {
		const product = parseProductMarkdown(HOODIE, "hoodie");

		expect(product.id).toBe("hoodie");
		expect(product.supplier).toBe("printeez");
		expect(product.price).toBe(65);
		expect(product.name).toEqual({ fr: "Hoodie", en: "Hoodie" });
		expect(product.variantGroups?.map((group) => group.id)).toEqual([
			"color",
			"size",
		]);

		const color = product.variantGroups?.[0];
		expect(color?.type).toBe("color");
		expect(color?.options).toEqual([
			{
				id: "black",
				label: { fr: "Noir", en: "Black" },
				swatchHex: "#1F1F1F",
				orderProductId: "black-hoodie",
			},
			{
				id: "beige",
				label: { fr: "Beige", en: "Beige" },
				swatchHex: "#D8C8AE",
				orderProductId: "beige-hoodie",
			},
		]);
		expect(product.variantGroups?.[1].options.map((o) => o.id)).toEqual([
			"s",
			"m",
			"l",
		]);
		expect(product.description.fr).toContain("Un **hoodie** doux.");
	});

	it("names the file and the field when something is missing", () => {
		expect(() =>
			parseProductMarkdown(HOODIE.replace("supplier: printeez\n", ""), "hoodie"),
		).toThrow(/\[produit hoodie\.md\] « supplier » est requis/);
		expect(() =>
			parseProductMarkdown(
				HOODIE.replace("supplier: printeez", "supplier: inconnu"),
				"hoodie",
			),
		).toThrow(/printeez, fournisseur-b/);
		expect(() =>
			parseProductMarkdown(HOODIE.replace('"#1f1f1f"', "noir"), "hoodie"),
		).toThrow(/« hex »/);
		expect(() => parseProductMarkdown("Pas de frontmatter", "x")).toThrow(
			/frontmatter introuvable/,
		);
	});

	it("rejects an image tagged with an unknown variant", () => {
		const source = HOODIE.replace(
			"  - /merch/size-guide.png",
			"  - { src: /merch/x.png, when: { color: rose } }",
		);
		expect(() => parseProductMarkdown(source, "hoodie")).toThrow(
			/choix inconnu « rose »/,
		);
	});
});

describe("getImagesForSelection", () => {
	const product = parseProductMarkdown(HOODIE, "hoodie");

	it("shows the selected colour first, then shared images, never another colour", () => {
		expect(getImagesForSelection(product, { color: "beige" })).toEqual([
			"/merch/hoodie-beige.png",
			"/merch/size-guide.png",
		]);
		expect(getImagesForSelection(product, { color: "black", size: "m" })).toEqual(
			["/merch/hoodie-noir.png", "/merch/size-guide.png"],
		);
	});

	it("shows everything when nothing is selected", () => {
		expect(getImagesForSelection(product)).toHaveLength(3);
	});
});

describe("merged colours and order identifiers", () => {
	const hoodie = parseProductMarkdown(HOODIE, "hoodie");
	const catalog = buildCatalog([hoodie]);

	it("sends the colour's own article id to the order", () => {
		expect(
			resolveOrderProductSelection(catalog[0], { color: "beige", size: "m" }),
		).toEqual({ orderProductId: "beige-hoodie", unitPrice: 65 });
	});

	it("finds the merged product from an order that predates the merge", () => {
		const legacyOptions = { size: "m" };
		const found = findProductByOrderProductId(
			catalog,
			"black-hoodie",
			legacyOptions,
		);
		expect(found?.id).toBe("hoodie");
		expect(withImpliedOptions(found, "black-hoodie", legacyOptions)).toEqual({
			color: "black",
			size: "m",
		});
	});

	it("never overrides a colour that was recorded with the order", () => {
		const options = { color: "beige", size: "m" };
		expect(withImpliedOptions(catalog[0], "black-hoodie", options)).toBe(
			options,
		);
	});
});

describe("buildCatalog", () => {
	it("sorts by order and refuses duplicate ids", () => {
		const first = { ...parseProductMarkdown(HOODIE, "b"), order: 20 };
		const second = { ...parseProductMarkdown(HOODIE, "a"), order: 10 };
		expect(buildCatalog([first, second]).map((p) => p.id)).toEqual(["a", "b"]);
		expect(() => buildCatalog([first, { ...first }])).toThrow(/deux fichiers/);
	});
});

describe("markdown", () => {
	it("renders paragraphs, lists and bold, and escapes HTML", () => {
		const html = renderMarkdown(
			"Un **hoodie** <script>doux</script>.\n\n- Coton\n- Poche",
		);
		expect(html).toBe(
			"<p>Un <strong>hoodie</strong> &lt;script&gt;doux&lt;/script&gt;.</p><ul><li>Coton</li><li>Poche</li></ul>",
		);
	});

	it("flattens markdown for card previews", () => {
		expect(markdownToPlainText("Un **hoodie** doux.\n\n- Coton\n- Poche")).toBe(
			"Un hoodie doux. Coton. Poche.",
		);
	});
});

describe("the real catalog (content/products)", () => {
	it("loads every product file, each with a supplier", () => {
		expect(products.length).toBeGreaterThan(0);
		for (const product of products) {
			expect(["printeez", "fournisseur-b"]).toContain(product.supplier);
			expect(product.name.fr).not.toBe("");
		}
	});

	it("has one product per article, colours as swatches", () => {
		const ids = products.map((product) => product.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toContain("hoodie");
		expect(ids).not.toContain("black-hoodie");
		expect(ids).not.toContain("beige-hoodie");

		const hoodie = products.find((product) => product.id === "hoodie");
		const colors = hoodie?.variantGroups?.find((g) => g.type === "color");
		expect(colors?.options.map((option) => option.id)).toEqual([
			"black",
			"beige",
		]);
	});
});
