import {
	DB_IMAGE_PREFIX,
	getDbImageId,
	isDbImage,
	rememberDbImage,
} from "@/lib/image-store";
import { neonClient } from "@/lib/neon-client";
import type {
	Category,
	Product,
	ProductImage,
	ProductVariantGroup,
	StoreLocale,
} from "@/types/merch";

type ProductRow = {
	id: string;
	is_active: boolean;
	sort_order: number;
	category: Category;
	price: string | number;
	supplier: string | null;
	supplier_url: string | null;
	cost: string | number | null;
	name: Record<StoreLocale, string>;
	description: Partial<Record<StoreLocale, string>>;
	variant_groups: ProductVariantGroup[];
	images: ProductImage[];
};

const PRODUCT_COLUMNS =
	"id,is_active,sort_order,category,price,supplier,supplier_url,cost,name,description,variant_groups,images";
const IMAGE_MAX_DIMENSION = 1000;
const IMAGE_QUALITY = 0.82;

const toProduct = (row: ProductRow): Product => ({
	id: row.id,
	category: row.category,
	price: Number(row.price),
	supplier: row.supplier,
	supplierUrl: row.supplier_url,
	cost: row.cost === null ? null : Number(row.cost),
	isActive: row.is_active,
	sortOrder: row.sort_order,
	images: row.images ?? [],
	...(row.variant_groups?.length > 0
		? { variantGroups: row.variant_groups }
		: {}),
	name: row.name,
	description: {
		fr: row.description?.fr ?? "",
		en: row.description?.en ?? row.description?.fr ?? "",
	},
});

const toProductRow = (product: Product): ProductRow => ({
	id: product.id,
	is_active: product.isActive,
	sort_order: product.sortOrder,
	category: product.category,
	price: product.price,
	supplier: product.supplier,
	supplier_url: product.supplierUrl,
	cost: product.cost,
	name: product.name,
	description: product.description,
	variant_groups: product.variantGroups ?? [],
	images: product.images,
});

export const sortProducts = (products: Product[]) =>
	[...products].sort(
		(left, right) =>
			left.sortOrder - right.sortOrder ||
			left.name.fr.localeCompare(right.name.fr, "fr"),
	);

export const fetchProducts = async () => {
	const result = await neonClient.from("products").select(PRODUCT_COLUMNS);
	if (result.error) {
		throw result.error;
	}
	return sortProducts(((result.data ?? []) as ProductRow[]).map(toProduct));
};

export const createProduct = async (product: Product) => {
	const result = await neonClient
		.from("products")
		.insert(toProductRow(product));
	if (result.error) {
		throw result.error;
	}
};

export const updateProduct = async (product: Product) => {
	const { id, ...fields } = toProductRow(product);
	const result = await neonClient
		.from("products")
		.update({ ...fields, updated_at: new Date().toISOString() })
		.eq("id", id);
	if (result.error) {
		throw result.error;
	}
};

export const deleteProductImages = async (sources: string[]) => {
	const imageIds = sources.filter(isDbImage).map(getDbImageId);
	if (imageIds.length === 0) {
		return;
	}
	const result = await neonClient
		.from("product_images")
		.delete()
		.in("id", imageIds);
	if (result.error) {
		throw result.error;
	}
};

export const deleteProduct = async (product: Product) => {
	const result = await neonClient
		.from("products")
		.delete()
		.eq("id", product.id);
	if (result.error) {
		throw result.error;
	}
	await deleteProductImages(product.images.map((image) => image.src));
};

const readImageAsDataUrl = async (file: File) => {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(
		1,
		IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
	);
	const canvas = document.createElement("canvas");
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Canvas indisponible");
	}
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
};

const insertProductImage = async (dataUrl: string) => {
	const id = crypto.randomUUID();
	const result = await neonClient
		.from("product_images")
		.insert({ id, data_url: dataUrl });
	if (result.error) {
		throw result.error;
	}
	rememberDbImage(id, dataUrl);
	return `${DB_IMAGE_PREFIX}${id}`;
};

export const uploadProductImage = async (file: File) =>
	insertProductImage(await readImageAsDataUrl(file));

export const copyProductImage = async (src: string) => {
	const result = await neonClient
		.from("product_images")
		.select("data_url")
		.eq("id", getDbImageId(src))
		.single();
	if (result.error) {
		throw result.error;
	}
	return insertProductImage((result.data as { data_url: string }).data_url);
};

export const updateProductSortOrders = async (
	changes: Array<{ id: string; sortOrder: number }>,
) => {
	const results = await Promise.all(
		changes.map((change) =>
			neonClient
				.from("products")
				.update({ sort_order: change.sortOrder })
				.eq("id", change.id),
		),
	);
	const failed = results.find((result) => result.error);
	if (failed?.error) {
		throw failed.error;
	}
};
