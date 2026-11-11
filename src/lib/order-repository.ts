import { neonClient } from "@/lib/neon-client";
import type { StoreLocale } from "@/types/merch";

export type OrderPayload = {
	requestId: string;
	submittedAt: string;
	locale: StoreLocale;
	itemCount: number;
	itemsSummary: string;
	items: Array<{
		id: string;
		productId: string;
		productName: string;
		quantity: number;
		unitPrice: number;
		lineTotal: number;
		selectedOptions: Record<string, string>;
		selectedOptionLabels: Record<string, string>;
	}>;
	totals: {
		subtotal: number;
		creditUsed: number;
		creditRemaining: number;
		walletToPay: number;
	};
};

export type StoredOrderItem = {
	id: string;
	cartLineId: string;
	productId: string;
	productName: string;
	quantity: number;
	lineTotal: number;
	selectedOptions: Record<string, string>;
	selectedOptionLabels?: Record<string, string>;
};

export type StoredOrder = {
	id: string;
	edition: number;
	userId: string;
	userEmail: string | null;
	itemCount: number;
	subtotal: number;
	placedAt: string | null;
	createdAt: string;
	items: StoredOrderItem[];
};

type OrderRow = {
	id: string;
	edition: number;
	user_id: string;
	user_email: string | null;
	item_count: number;
	subtotal: string | number;
	placed_at: string | null;
	created_at: string;
	raw_payload: unknown;
};

type OrderItemRow = {
	id: string;
	order_id: string;
	cart_line_id: string;
	product_id: string | null;
	product_name: string;
	quantity: number;
	line_total: string | number;
	selected_options: Record<string, string> | null;
};

const ORDER_COLUMNS =
	"id,edition,user_id,user_email,item_count,subtotal,placed_at,created_at,raw_payload";
const ORDER_ITEM_COLUMNS =
	"id,order_id,cart_line_id,product_id,product_name,quantity,line_total,selected_options";
const ORDER_ID_BATCH_SIZE = 50;

const readOptionLabels = (rawPayload: unknown) => {
	const labelsByCartLineId = new Map<string, Record<string, string>>();
	if (!rawPayload || typeof rawPayload !== "object") {
		return labelsByCartLineId;
	}
	const payloadItems = (rawPayload as Record<string, unknown>).items;
	if (!Array.isArray(payloadItems)) {
		return labelsByCartLineId;
	}
	for (const item of payloadItems) {
		if (!item || typeof item !== "object") {
			continue;
		}
		const casted = item as Record<string, unknown>;
		if (
			typeof casted.id === "string" &&
			casted.selectedOptionLabels &&
			typeof casted.selectedOptionLabels === "object"
		) {
			labelsByCartLineId.set(
				casted.id,
				casted.selectedOptionLabels as Record<string, string>,
			);
		}
	}
	return labelsByCartLineId;
};

const toStoredOrders = (
	orderRows: OrderRow[],
	itemRows: OrderItemRow[],
): StoredOrder[] =>
	orderRows.map((order) => {
		const labelsByCartLineId = readOptionLabels(order.raw_payload);
		return {
			id: order.id,
			edition: order.edition,
			userId: order.user_id,
			userEmail: order.user_email,
			itemCount: order.item_count,
			subtotal: Number(order.subtotal),
			placedAt: order.placed_at,
			createdAt: order.created_at,
			items: itemRows
				.filter((item) => item.order_id === order.id)
				.map((item) => ({
					id: item.id,
					cartLineId: item.cart_line_id,
					productId: item.product_id ?? "",
					productName: item.product_name,
					quantity: item.quantity,
					lineTotal: Number(item.line_total),
					selectedOptions: item.selected_options ?? {},
					selectedOptionLabels: labelsByCartLineId.get(item.cart_line_id),
				})),
		};
	});

const fetchOrderItems = async (orderIds: string[]) => {
	const itemRows: OrderItemRow[] = [];
	for (let start = 0; start < orderIds.length; start += ORDER_ID_BATCH_SIZE) {
		const result = await neonClient
			.from("order_items")
			.select(ORDER_ITEM_COLUMNS)
			.in("order_id", orderIds.slice(start, start + ORDER_ID_BATCH_SIZE));
		if (result.error) {
			throw result.error;
		}
		itemRows.push(...((result.data ?? []) as OrderItemRow[]));
	}
	return itemRows;
};

export const fetchUserOrders = async (userId: string) => {
	const ordersResult = await neonClient
		.from("orders")
		.select(ORDER_COLUMNS)
		.eq("user_id", userId)
		.order("edition", { ascending: false });
	if (ordersResult.error) {
		throw ordersResult.error;
	}
	const orderRows = (ordersResult.data ?? []) as OrderRow[];
	const itemRows = await fetchOrderItems(orderRows.map((order) => order.id));
	return toStoredOrders(orderRows, itemRows);
};

export const fetchAllOrders = async () => {
	const ordersResult = await neonClient
		.from("orders")
		.select(ORDER_COLUMNS)
		.order("created_at", { ascending: false });
	if (ordersResult.error) {
		throw ordersResult.error;
	}
	const itemsResult = await neonClient
		.from("order_items")
		.select(ORDER_ITEM_COLUMNS);
	if (itemsResult.error) {
		throw itemsResult.error;
	}
	return toStoredOrders(
		(ordersResult.data ?? []) as OrderRow[],
		(itemsResult.data ?? []) as OrderItemRow[],
	);
};

export const saveOrder = async (input: {
	orderId: string | null;
	userId: string;
	userEmail: string | null;
	edition: number;
	placedAt: string | null;
	payload: OrderPayload;
}) => {
	const { payload } = input;
	const orderFields = {
		submitted_at: payload.submittedAt,
		user_email: input.userEmail,
		locale: payload.locale,
		item_count: payload.itemCount,
		items_summary: payload.itemsSummary,
		subtotal: payload.totals.subtotal,
		credit_used: payload.totals.creditUsed,
		credit_remaining: payload.totals.creditRemaining,
		wallet_to_pay: payload.totals.walletToPay,
		placed_at: input.placedAt,
		raw_payload: payload,
	};

	let orderId = input.orderId;
	if (orderId) {
		const updateOrder = await neonClient
			.from("orders")
			.update(orderFields)
			.eq("id", orderId)
			.eq("user_id", input.userId);
		if (updateOrder.error) {
			throw updateOrder.error;
		}
	} else {
		orderId = crypto.randomUUID();
		const insertOrder = await neonClient.from("orders").insert({
			id: orderId,
			request_id: payload.requestId,
			user_id: input.userId,
			edition: input.edition,
			...orderFields,
		});
		if (insertOrder.error) {
			throw insertOrder.error;
		}
	}

	const existingItems = await neonClient
		.from("order_items")
		.select("id,cart_line_id")
		.eq("order_id", orderId);
	if (existingItems.error) {
		throw existingItems.error;
	}
	const existingIdByCartLineId = new Map(
		(
			(existingItems.data ?? []) as Array<{ id: string; cart_line_id: string }>
		).map((item) => [item.cart_line_id, item.id]),
	);

	const savedItems = await neonClient.from("order_items").upsert(
		payload.items.map((item) => ({
			id: existingIdByCartLineId.get(item.id) ?? crypto.randomUUID(),
			order_id: orderId,
			cart_line_id: item.id,
			product_id: item.productId,
			product_name: item.productName,
			quantity: item.quantity,
			unit_price: item.unitPrice,
			line_total: item.lineTotal,
			selected_options: item.selectedOptions,
		})),
		{ onConflict: "id" },
	);
	if (savedItems.error) {
		throw savedItems.error;
	}

	const keptCartLineIds = new Set(payload.items.map((item) => item.id));
	const removedItemIds = [...existingIdByCartLineId]
		.filter(([cartLineId]) => !keptCartLineIds.has(cartLineId))
		.map(([, id]) => id);
	if (removedItemIds.length > 0) {
		const deleteItems = await neonClient
			.from("order_items")
			.delete()
			.in("id", removedItemIds);
		if (deleteItems.error) {
			throw deleteItems.error;
		}
	}

	return orderId;
};

export const deleteOrder = async (orderId: string) => {
	const result = await neonClient.from("orders").delete().eq("id", orderId);
	if (result.error) {
		throw result.error;
	}
};
