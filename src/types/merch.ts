import type { SupplierId } from "@/config/suppliers";

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
	supplier: SupplierId;
	/** Toutes les images, dans l'ordre du fichier markdown. */
	images: ProductImage[];
	/** Les mêmes images, à plat (compatibilité avec les vues existantes). */
	imageGallery: string[];
	variantGroups?: ProductVariantGroup[];
	name: Record<StoreLocale, string>;
	/** Description en markdown (corps du fichier produit). */
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
	supplier?: SupplierId | null;
	images?: ProductImage[];
	imageGallery?: string[];
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
