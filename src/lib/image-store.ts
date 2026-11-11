import { reactive } from "vue";

import { neonClient } from "@/lib/neon-client";

export const DB_IMAGE_PREFIX = "db:";

const PLACEHOLDER =
	"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const BATCH_SIZE = 8;

const loadedImages = reactive(new Map<string, string>());
const requestedIds = new Set<string>();
let queuedIds: string[] = [];
let isFlushScheduled = false;

const flushQueue = async () => {
	isFlushScheduled = false;
	const ids = queuedIds;
	queuedIds = [];
	for (let start = 0; start < ids.length; start += BATCH_SIZE) {
		const batch = ids.slice(start, start + BATCH_SIZE);
		try {
			const result = await neonClient
				.from("product_images")
				.select("id,data_url")
				.in("id", batch);
			if (result.error) {
				throw result.error;
			}
			for (const row of (result.data ?? []) as Array<{
				id: string;
				data_url: string;
			}>) {
				loadedImages.set(row.id, row.data_url);
			}
		} catch (error) {
			console.error(error);
			for (const id of batch) {
				requestedIds.delete(id);
			}
		}
	}
};

const requestImage = (id: string) => {
	if (requestedIds.has(id)) {
		return;
	}
	requestedIds.add(id);
	queuedIds.push(id);
	if (!isFlushScheduled) {
		isFlushScheduled = true;
		window.setTimeout(() => void flushQueue(), 0);
	}
};

export const isDbImage = (src: string) => src.startsWith(DB_IMAGE_PREFIX);

export const getDbImageId = (src: string) => src.slice(DB_IMAGE_PREFIX.length);

export const resolveImageSrc = (src: string) => {
	if (!isDbImage(src)) {
		return src;
	}
	const id = getDbImageId(src);
	const loaded = loadedImages.get(id);
	if (loaded) {
		return loaded;
	}
	requestImage(id);
	return PLACEHOLDER;
};

export const rememberDbImage = (id: string, dataUrl: string) => {
	requestedIds.add(id);
	loadedImages.set(id, dataUrl);
};
