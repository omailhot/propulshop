import { SORT_ORDER_STEP } from "@/config/merch-store";
import { slugify } from "@/lib/utils";
import type {
	Category,
	Product,
	ProductImage,
	ProductVariantGroup,
} from "@/types/merch";

export type OptionDraft = {
	key: string;
	id: string;
	labelFr: string;
	labelEn: string;
	swatchHex: string;
	priceDelta: string;
	sku: string;
	supplierLabel: string;
};

export type GroupDraft = {
	key: string;
	id: string;
	type: ProductVariantGroup["type"];
	labelFr: string;
	labelEn: string;
	options: OptionDraft[];
};

export type ImageDraft = {
	key: string;
	src: string;
	file: File | null;
	previewUrl: string;
	optionKey: string;
	combinedWhen: Record<string, string> | null;
};

export type ProductDraft = {
	id: string;
	nameFr: string;
	nameEn: string;
	category: Category;
	supplier: string;
	supplierUrl: string;
	cost: string;
	price: string;
	sortOrder: number;
	isActive: boolean;
	descriptionFr: string;
	descriptionEn: string;
	groups: GroupDraft[];
	images: ImageDraft[];
};

export const GROUP_PRESETS: Record<
	ProductVariantGroup["type"],
	{ id: string; labelFr: string; labelEn: string }
> = {
	color: { id: "color", labelFr: "Couleur", labelEn: "Color" },
	size: { id: "size", labelFr: "Taille", labelEn: "Size" },
	select: { id: "", labelFr: "", labelEn: "" },
};

const DEFAULT_SWATCH_HEX = "#1F1F1F";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const PRODUCT_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SUPPLIER_URL = /^https?:\/\/\S+$/;
const COPY_SUFFIX = "copie";

const createKey = () => crypto.randomUUID();

export const createOptionDraft = (): OptionDraft => ({
	key: createKey(),
	id: "",
	labelFr: "",
	labelEn: "",
	swatchHex: DEFAULT_SWATCH_HEX,
	priceDelta: "",
	sku: "",
	supplierLabel: "",
});

export const createGroupDraft = (
	type: ProductVariantGroup["type"],
): GroupDraft => ({
	key: createKey(),
	...GROUP_PRESETS[type],
	type,
	options: [createOptionDraft()],
});

export const createImageDraft = (
	input: Pick<ImageDraft, "src" | "file" | "previewUrl">,
): ImageDraft => ({
	key: createKey(),
	...input,
	optionKey: "",
	combinedWhen: null,
});

const getLastSortOrder = (products: Product[]) =>
	Math.max(0, ...products.map((product) => product.sortOrder));

export const createProductDraft = (products: Product[]): ProductDraft => ({
	id: "",
	nameFr: "",
	nameEn: "",
	category: "wearables",
	supplier: "",
	supplierUrl: "",
	cost: "",
	price: "",
	sortOrder:
		getLastSortOrder(products.filter((product) => product.isActive)) +
		SORT_ORDER_STEP,
	isActive: true,
	descriptionFr: "",
	descriptionEn: "",
	groups: [],
	images: [],
});

export const toProductDraft = (product: Product): ProductDraft => {
	const groups: GroupDraft[] = (product.variantGroups ?? []).map((group) => ({
		key: createKey(),
		id: group.id,
		type: group.type,
		labelFr: group.label.fr,
		labelEn: group.label.en === group.label.fr ? "" : group.label.en,
		options: group.options.map((option) => ({
			key: createKey(),
			id: option.id,
			labelFr: option.label.fr,
			labelEn: option.label.en === option.label.fr ? "" : option.label.en,
			swatchHex: option.swatchHex ?? DEFAULT_SWATCH_HEX,
			priceDelta:
				option.priceDelta === undefined ? "" : String(option.priceDelta),
			sku: option.orderProductId ?? "",
			supplierLabel: option.supplierLabel ?? "",
		})),
	}));

	const findOptionKey = (when: Record<string, string>) => {
		const [[groupId, optionId]] = Object.entries(when);
		return (
			groups
				.find((group) => group.id === groupId)
				?.options.find((option) => option.id === optionId)?.key ?? ""
		);
	};

	return {
		id: product.id,
		nameFr: product.name.fr,
		nameEn: product.name.en === product.name.fr ? "" : product.name.en,
		category: product.category,
		supplier: product.supplier ?? "",
		supplierUrl: product.supplierUrl ?? "",
		cost: product.cost === null ? "" : String(product.cost),
		price: String(product.price),
		sortOrder: product.sortOrder,
		isActive: product.isActive,
		descriptionFr: product.description.fr,
		descriptionEn:
			product.description.en === product.description.fr
				? ""
				: product.description.en,
		groups,
		images: product.images.map((image) => {
			const conditionCount = Object.keys(image.when ?? {}).length;
			return {
				key: createKey(),
				src: image.src,
				file: null,
				previewUrl: "",
				optionKey:
					image.when && conditionCount === 1 ? findOptionKey(image.when) : "",
				combinedWhen: image.when && conditionCount > 1 ? image.when : null,
			};
		}),
	};
};

export const toDuplicateDraft = (
	product: Product,
	products: Product[],
): ProductDraft => {
	const existingIds = new Set(products.map((item) => item.id));
	let id = `${product.id}-${COPY_SUFFIX}`;
	for (let copyNumber = 2; existingIds.has(id); copyNumber += 1) {
		id = `${product.id}-${COPY_SUFFIX}-${copyNumber}`;
	}
	return {
		...toProductDraft(product),
		id,
		nameFr: `${product.name.fr} (${COPY_SUFFIX})`,
		sortOrder: getLastSortOrder(products) + SORT_ORDER_STEP,
	};
};

export const validateProductDraft = (
	draft: ProductDraft,
	existingIds: string[],
	isNew: boolean,
) => {
	const errors: string[] = [];
	if (!draft.nameFr.trim()) {
		errors.push("Le nom est requis.");
	}
	if (!PRODUCT_ID.test(draft.id)) {
		errors.push(
			"L'identifiant est requis: lettres minuscules, chiffres et tirets seulement.",
		);
	} else if (isNew && existingIds.includes(draft.id)) {
		errors.push("Cet identifiant est déjà utilisé par un autre article.");
	}
	const price = Number(draft.price);
	if (draft.price.trim() === "" || !Number.isFinite(price) || price < 0) {
		errors.push("Le prix est requis et doit être un nombre positif.");
	}
	const cost = Number(draft.cost);
	if (draft.cost.trim() !== "" && (!Number.isFinite(cost) || cost < 0)) {
		errors.push("Le coût doit être un nombre positif.");
	}
	if (
		draft.supplierUrl.trim() &&
		!SUPPLIER_URL.test(draft.supplierUrl.trim())
	) {
		errors.push("Le lien du fournisseur doit commencer par https://.");
	}

	const groupIds = new Set<string>();
	for (const group of draft.groups) {
		const groupName = group.labelFr.trim() || "Option sans nom";
		const groupId = group.id || slugify(group.labelFr);
		if (!group.labelFr.trim()) {
			errors.push("Chaque option doit avoir un nom.");
		} else if (groupIds.has(groupId)) {
			errors.push(`L'option « ${groupName} » est en double.`);
		}
		groupIds.add(groupId);
		if (group.options.length === 0) {
			errors.push(`« ${groupName} »: ajoutez au moins un choix.`);
		}
		const optionIds = new Set<string>();
		for (const option of group.options) {
			const optionId = option.id || slugify(option.labelFr);
			if (!option.labelFr.trim() || !optionId) {
				errors.push(`« ${groupName} »: chaque choix doit avoir un nom.`);
				continue;
			}
			if (optionIds.has(optionId)) {
				errors.push(
					`« ${groupName} »: le choix « ${option.labelFr.trim()} » est en double.`,
				);
			}
			optionIds.add(optionId);
			if (group.type === "color" && !HEX_COLOR.test(option.swatchHex)) {
				errors.push(
					`« ${groupName} »: la couleur de « ${option.labelFr.trim()} » doit être au format #RRGGBB.`,
				);
			}
			if (
				option.priceDelta.trim() !== "" &&
				!Number.isFinite(Number(option.priceDelta))
			) {
				errors.push(
					`« ${groupName} »: l'écart de prix de « ${option.labelFr.trim()} » doit être un nombre.`,
				);
			}
		}
	}
	return [...new Set(errors)];
};

const localized = (fr: string, en: string) => ({
	fr: fr.trim(),
	en: en.trim() || fr.trim(),
});

export const toProduct = (
	draft: ProductDraft,
	uploadedSources: Map<string, string>,
): Product => {
	const optionIdsByKey = new Map<string, { groupId: string; id: string }>();
	const variantGroups: ProductVariantGroup[] = draft.groups.map((group) => {
		const groupId = group.id || slugify(group.labelFr);
		return {
			id: groupId,
			label: localized(group.labelFr, group.labelEn),
			type: group.type,
			options: group.options.map((option) => {
				const id = option.id || slugify(option.labelFr);
				optionIdsByKey.set(option.key, { groupId, id });
				return {
					id,
					label: localized(option.labelFr, option.labelEn),
					...(group.type === "color"
						? { swatchHex: option.swatchHex.toUpperCase() }
						: {}),
					...(option.sku.trim() ? { orderProductId: option.sku.trim() } : {}),
					...(option.supplierLabel.trim()
						? { supplierLabel: option.supplierLabel.trim() }
						: {}),
					...(option.priceDelta.trim() !== "" && Number(option.priceDelta) !== 0
						? { priceDelta: Number(option.priceDelta) }
						: {}),
				};
			}),
		};
	});

	const images: ProductImage[] = draft.images.map((image) => {
		const src = uploadedSources.get(image.key) ?? image.src;
		if (image.combinedWhen) {
			return { src, when: image.combinedWhen };
		}
		const option = optionIdsByKey.get(image.optionKey);
		return option ? { src, when: { [option.groupId]: option.id } } : { src };
	});

	return {
		id: draft.id,
		category: draft.category,
		price: Number(draft.price),
		supplier: draft.supplier.trim() || null,
		supplierUrl: draft.supplierUrl.trim() || null,
		cost: draft.cost.trim() === "" ? null : Number(draft.cost),
		isActive: draft.isActive,
		sortOrder: draft.sortOrder,
		images,
		...(variantGroups.length > 0 ? { variantGroups } : {}),
		name: localized(draft.nameFr, draft.nameEn),
		description: localized(draft.descriptionFr, draft.descriptionEn),
	};
};
