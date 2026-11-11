import { computed, ref } from "vue";

import { type Edition, PENDING_EDITION } from "@/config/edition";
import {
	createEdition,
	deleteEdition,
	fetchEditions,
	updateEdition,
} from "@/lib/edition-repository";

const EDITIONS_CACHE_KEY = "propulshop-editions";

const readCachedEditions = (): Edition[] => {
	try {
		const parsed = JSON.parse(
			window.localStorage.getItem(EDITIONS_CACHE_KEY) ?? "[]",
		);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

export function useEditions() {
	const editions = ref<Edition[]>(readCachedEditions());

	const currentEdition = computed(
		() => editions.value[editions.value.length - 1] ?? PENDING_EDITION,
	);
	const isCreditKnown = computed(
		() => currentEdition.value.creditPerEmployee !== null,
	);
	const companyCredit = computed(
		() => currentEdition.value.creditPerEmployee ?? 0,
	);

	const getEdition = (number: number) =>
		editions.value.find((edition) => edition.number === number) ??
		currentEdition.value;

	const loadEditions = async () => {
		try {
			editions.value = await fetchEditions();
			window.localStorage.setItem(
				EDITIONS_CACHE_KEY,
				JSON.stringify(editions.value),
			);
		} catch (error) {
			console.warn("Éditions indisponibles", error);
		}
	};

	const addEdition = async (edition: Edition) => {
		await createEdition(edition);
		await loadEditions();
	};

	const saveEdition = async (edition: Edition) => {
		await updateEdition(edition);
		await loadEditions();
	};

	const removeEdition = async (number: number) => {
		await deleteEdition(number);
		await loadEditions();
	};

	return {
		editions,
		currentEdition,
		isCreditKnown,
		companyCredit,
		getEdition,
		loadEditions,
		addEdition,
		saveEdition,
		removeEdition,
	};
}
