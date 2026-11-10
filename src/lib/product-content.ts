import { parse as parseYaml } from "yaml";

// Imports relatifs (et non "@/"): ce module est aussi chargé par
// vite.config.ts, hors de la résolution d'alias de l'application.
import { isSupplierId, SUPPLIER_IDS } from "../config/suppliers";
import type { ParsedProduct } from "./product-catalog";
import type {
	Category,
	ProductImage,
	ProductVariantGroup,
	ProductVariantOption,
	StoreLocale,
} from "../types/merch";

export const PRODUCT_CATEGORIES: Category[] = [
	"wearables",
	"desk",
	"travel",
	"lifestyle",
	"giftcard",
];

type Dict = Record<string, unknown>;

const FRONTMATTER = /^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const isDict = (value: unknown): value is Dict =>
	Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asText = (value: unknown) =>
	typeof value === "string" || typeof value === "number"
		? String(value).trim()
		: "";

const localized = (
	fr: unknown,
	en: unknown,
): Record<StoreLocale, string> => {
	const french = asText(fr);
	return { fr: french, en: asText(en) || french };
};

/**
 * Transforme un fichier produit (frontmatter YAML + corps markdown) en
 * `Product`. Lance une erreur lisible, avec le nom du fichier, dès qu'un
 * champ requis manque: l'erreur s'affiche dans le terminal et dans le
 * navigateur pendant `dev`, et fait échouer `build`.
 */
export function parseProductMarkdown(
	source: string,
	fileName: string,
): ParsedProduct {
	const fail = (message: string): never => {
		throw new Error(`[produit ${fileName}.md] ${message}`);
	};

	const match = FRONTMATTER.exec(source);
	if (!match) {
		return fail(
			"frontmatter introuvable: le fichier doit commencer par un bloc entre deux lignes « --- ».",
		);
	}

	let meta: unknown;
	try {
		meta = parseYaml(match[1]);
	} catch (error) {
		return fail(
			`YAML invalide: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
	if (!isDict(meta)) {
		return fail("le frontmatter doit être une liste de clés et de valeurs.");
	}

	const id = asText(meta.id) || fileName;

	const name = localized(meta.name, meta.name_en);
	if (!name.fr) {
		fail("« name » est requis.");
	}

	const category = asText(meta.category) as Category;
	if (!PRODUCT_CATEGORIES.includes(category)) {
		fail(
			`« category » doit valoir l'une de: ${PRODUCT_CATEGORIES.join(", ")}.`,
		);
	}

	const price = Number(meta.price);
	if (meta.price == null || !Number.isFinite(price) || price < 0) {
		fail("« price » est requis et doit être un nombre positif.");
	}

	const supplier = meta.supplier;
	if (!isSupplierId(supplier)) {
		return fail(
			`« supplier » est requis et doit valoir l'une de: ${SUPPLIER_IDS.join(", ")} (voir src/config/suppliers.ts).`,
		);
	}

	const order = meta.order == null ? 1000 : Number(meta.order);
	if (!Number.isFinite(order)) {
		fail("« order » doit être un nombre.");
	}

	const variantGroups: ProductVariantGroup[] = [];
	const images: ProductImage[] = [];

	const readVariantExtras = (
		entry: Dict,
	): Pick<ProductVariantOption, "orderProductId" | "priceDelta"> => {
		const extras: Pick<ProductVariantOption, "orderProductId" | "priceDelta"> =
			{};
		const sku = asText(entry.sku);
		if (sku) {
			extras.orderProductId = sku;
		}
		if (entry.price_delta != null) {
			const delta = Number(entry.price_delta);
			if (!Number.isFinite(delta)) {
				fail("« price_delta » doit être un nombre.");
			}
			extras.priceDelta = delta;
		}
		return extras;
	};

	// --- Couleurs: un seul produit, une pastille par couleur ---------------
	if (meta.colors != null) {
		if (!Array.isArray(meta.colors) || meta.colors.length === 0) {
			fail("« colors » doit être une liste non vide.");
		}
		const options: ProductVariantOption[] = [];
		for (const entry of meta.colors as unknown[]) {
			if (!isDict(entry)) {
				return fail("chaque couleur doit avoir « id », « name » et « hex ».");
			}
			const colorId = asText(entry.id);
			const label = localized(entry.name, entry.name_en);
			const hex = asText(entry.hex);
			if (!colorId || !label.fr) {
				fail("chaque couleur doit avoir « id » et « name ».");
			}
			if (!HEX_COLOR.test(hex)) {
				fail(
					`couleur « ${colorId} »: « hex » doit être au format "#RRGGBB" (entre guillemets).`,
				);
			}
			options.push({
				id: colorId,
				label,
				swatchHex: hex.toUpperCase(),
				...readVariantExtras(entry),
			});
			if (entry.images != null) {
				if (!Array.isArray(entry.images)) {
					fail(`couleur « ${colorId} »: « images » doit être une liste.`);
				}
				for (const src of entry.images as unknown[]) {
					const path = asText(src);
					if (!path) {
						fail(`couleur « ${colorId} »: chemin d'image vide.`);
					}
					images.push({ src: path, when: { color: colorId } });
				}
			}
		}
		variantGroups.push({
			id: "color",
			label: { fr: "Couleur", en: "Color" },
			type: "color",
			options,
		});
	}

	// --- Tailles ------------------------------------------------------------
	if (meta.sizes != null) {
		if (!Array.isArray(meta.sizes) || meta.sizes.length === 0) {
			fail("« sizes » doit être une liste non vide, ex. [S, M, L].");
		}
		variantGroups.push({
			id: "size",
			label: { fr: "Taille", en: "Size" },
			type: "size",
			options: (meta.sizes as unknown[]).map((entry) => {
				if (isDict(entry)) {
					const label = localized(entry.name, entry.name_en);
					const sizeId = asText(entry.id) || label.fr.toLowerCase();
					if (!sizeId) {
						fail("chaque taille doit avoir « name ».");
					}
					return { id: sizeId, label, ...readVariantExtras(entry) };
				}
				const text = asText(entry);
				if (!text) {
					fail("taille vide dans « sizes ».");
				}
				return { id: text.toLowerCase(), label: { fr: text, en: text } };
			}),
		});
	}

	// --- Autres options (ex. le visuel imprimé) ----------------------------
	if (meta.options != null) {
		if (!Array.isArray(meta.options)) {
			fail("« options » doit être une liste.");
		}
		for (const entry of meta.options as unknown[]) {
			if (!isDict(entry)) {
				return fail("chaque option doit avoir « id », « name » et « choices ».");
			}
			const groupId = asText(entry.id);
			const label = localized(entry.name, entry.name_en);
			if (!groupId || !label.fr) {
				fail("chaque option doit avoir « id » et « name ».");
			}
			if (groupId === "color" || groupId === "size") {
				fail(
					`option « ${groupId} »: utiliser plutôt les clés « colors » ou « sizes ».`,
				);
			}
			if (!Array.isArray(entry.choices) || entry.choices.length === 0) {
				fail(`option « ${groupId} »: « choices » doit être une liste non vide.`);
			}
			variantGroups.push({
				id: groupId,
				label,
				type: "select",
				options: (entry.choices as unknown[]).map((choice) => {
					if (!isDict(choice)) {
						return fail(
							`option « ${groupId} »: chaque choix doit avoir « id » et « name ».`,
						);
					}
					const choiceId = asText(choice.id);
					const choiceLabel = localized(choice.name, choice.name_en);
					if (!choiceId || !choiceLabel.fr) {
						fail(
							`option « ${groupId} »: chaque choix doit avoir « id » et « name ».`,
						);
					}
					return {
						id: choiceId,
						label: choiceLabel,
						...readVariantExtras(choice),
					};
				}),
			});
		}
	}

	// --- Images communes ou liées à une combinaison ------------------------
	if (meta.images != null) {
		if (!Array.isArray(meta.images)) {
			fail("« images » doit être une liste.");
		}
		for (const entry of meta.images as unknown[]) {
			if (isDict(entry)) {
				const src = asText(entry.src);
				if (!src) {
					fail("chaque image détaillée doit avoir « src ».");
				}
				const when: Record<string, string> = {};
				if (entry.when != null) {
					if (!isDict(entry.when)) {
						fail(`image « ${src} »: « when » doit être de la forme { color: black }.`);
					}
					for (const [groupId, optionId] of Object.entries(entry.when as Dict)) {
						const group = variantGroups.find((item) => item.id === groupId);
						const value = asText(optionId);
						if (!group) {
							fail(`image « ${src} »: « when » cite l'option inconnue « ${groupId} ».`);
						} else if (!group.options.some((option) => option.id === value)) {
							fail(
								`image « ${src} »: « when.${groupId} » cite le choix inconnu « ${value} ».`,
							);
						}
						when[groupId] = value;
					}
				}
				images.push(Object.keys(when).length > 0 ? { src, when } : { src });
				continue;
			}
			const src = asText(entry);
			if (!src) {
				fail("chemin d'image vide dans « images ».");
			}
			images.push({ src });
		}
	}

	for (const group of variantGroups) {
		const seen = new Set<string>();
		for (const option of group.options) {
			if (seen.has(option.id)) {
				fail(`option « ${group.id} »: le choix « ${option.id} » est en double.`);
			}
			seen.add(option.id);
		}
	}

	const body = (match[2] ?? "").trim();

	return {
		id,
		category,
		price,
		supplier,
		order,
		images,
		imageGallery: images.map((image) => image.src),
		...(variantGroups.length > 0 ? { variantGroups } : {}),
		name,
		description: {
			fr: body,
			en: asText(meta.description_en) || body,
		},
	};
}
