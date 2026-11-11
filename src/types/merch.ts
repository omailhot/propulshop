export type StoreLocale = "en" | "fr";

export type Category =
	| "wearables"
	| "desk"
	| "travel"
	| "lifestyle"
	| "giftcard";

export type ProductVariantOption = {
	id: string;
	label: Record<StoreLocale, string>;
	swatchHex?: string;
	orderProductId?: string;
	priceDelta?: number;
	supplierLabel?: string;
};

export type ProductVariantGroup = {
	id: string;
	label: Record<StoreLocale, string>;
	type: "size" | "color" | "select";
	options: ProductVariantOption[];
};

/**
 * Une image de produit. `when` indique la sélection qu'elle illustre
 * (ex. `{ color: "black" }`). Sans `when`, l'image vaut pour toutes les
 * variantes (photo portée, guide des tailles).
 */
export type ProductImage = {
	src: string;
	when?: Record<string, string>;
};

export type Product = {
	id: string;
	category: Category;
	price: number;
	supplier: string | null;
	supplierUrl: string | null;
	cost: number | null;
	isActive: boolean;
	sortOrder: number;
	images: ProductImage[];
	variantGroups?: ProductVariantGroup[];
	name: Record<StoreLocale, string>;
	description: Record<StoreLocale, string>;
};

export type CartItem = {
	id: string;
	productId: string;
	quantity: number;
	selectedOptions: Record<string, string>;
	selectedOptionLabels?: Record<string, string>;
};

/** Le produit tel que les vues de panier et de commande en ont besoin. */
export type CartLineProduct = {
	id?: string;
	name: Record<StoreLocale, string>;
	supplier?: string | null;
	supplierUrl?: string | null;
	images?: ProductImage[];
	variantGroups?: ProductVariantGroup[];
};

export type CartLineView = {
	id: string;
	quantity: number;
	lineTotal: number;
	selectedOptions: Record<string, string>;
	selectedOptionLabels?: Record<string, string>;
	product: CartLineProduct;
};
