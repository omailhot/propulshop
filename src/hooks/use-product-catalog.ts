import { computed, ref } from "vue";

import { SORT_ORDER_STEP } from "@/config/merch-store";
import {
	createProduct,
	deleteProduct,
	deleteProductImages,
	fetchProducts,
	sortProducts,
	updateProduct,
	updateProductSortOrders,
} from "@/lib/product-repository";
import type { Product } from "@/types/merch";

const CATALOG_CACHE_KEY = "propulshop-catalog";

const readCachedProducts = (): Product[] => {
	try {
		const parsed = JSON.parse(
			window.localStorage.getItem(CATALOG_CACHE_KEY) ?? "[]",
		);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

export function useProductCatalog() {
	const products = ref<Product[]>(readCachedProducts());
	const isLoaded = ref(products.value.length > 0);
	const isLoading = ref(false);
	const hasLoadFailed = ref(false);

	const shopProducts = computed(() =>
		products.value.filter((product) => product.isActive),
	);
	const suppliers = computed(() =>
		[
			...new Set(
				products.value
					.map((product) => product.supplier)
					.filter((supplier): supplier is string => Boolean(supplier)),
			),
		].sort((left, right) => left.localeCompare(right, "fr")),
	);

	const loadProducts = async () => {
		isLoading.value = true;
		try {
			products.value = await fetchProducts();
			isLoaded.value = true;
			hasLoadFailed.value = false;
			window.localStorage.setItem(
				CATALOG_CACHE_KEY,
				JSON.stringify(products.value),
			);
		} catch (error) {
			console.warn("Catalogue indisponible", error);
			hasLoadFailed.value = true;
		} finally {
			isLoading.value = false;
		}
	};

	const saveProduct = async (product: Product, isNew: boolean) => {
		const previous = products.value.find((item) => item.id === product.id);
		if (isNew) {
			await createProduct(product);
		} else {
			await updateProduct(product);
		}
		const keptSources = new Set(product.images.map((image) => image.src));
		await deleteProductImages(
			(previous?.images ?? [])
				.map((image) => image.src)
				.filter((src) => !keptSources.has(src)),
		);
		await loadProducts();
	};

	const removeProduct = async (product: Product) => {
		await deleteProduct(product);
		await loadProducts();
	};

	const reorderProducts = async (orderedIds: string[]) => {
		const sortOrderById = new Map(
			orderedIds.map((id, index) => [id, (index + 1) * SORT_ORDER_STEP]),
		);
		const changes = products.value
			.map((product) => ({
				id: product.id,
				previousSortOrder: product.sortOrder,
				sortOrder: sortOrderById.get(product.id) ?? product.sortOrder,
			}))
			.filter((change) => change.sortOrder !== change.previousSortOrder);
		products.value = sortProducts(
			products.value.map((product) => ({
				...product,
				sortOrder: sortOrderById.get(product.id) ?? product.sortOrder,
			})),
		);
		try {
			await updateProductSortOrders(changes);
		} finally {
			await loadProducts();
		}
	};

	return {
		products,
		shopProducts,
		suppliers,
		isLoaded,
		isLoading,
		hasLoadFailed,
		loadProducts,
		saveProduct,
		removeProduct,
		reorderProducts,
	};
}
