import type { Category } from "@/types/merch";

export const categoryOrder: Array<"all" | Category> = [
	"all",
	"wearables",
	"desk",
	"travel",
	"lifestyle",
	"giftcard",
];

export const SORT_ORDER_STEP = 10;

export const PRODUCT_CATEGORIES = categoryOrder.filter(
	(category): category is Category => category !== "all",
);
