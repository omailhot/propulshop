import type { ProductVariantGroup, StoreLocale } from "@/types/merch";

export type VariantChip = {
	key: string;
	group: string;
	label: string;
	/** Présent pour une option de couleur: la teinte de la pastille. */
	swatchHex?: string;
};

type LineLike = {
	selectedOptions: Record<string, string>;
	selectedOptionLabels?: Record<string, string>;
	product: {
		variantGroups?: ProductVariantGroup[];
	};
};

/**
 * Les variantes choisies pour une ligne de panier ou de commande, prêtes à
 * afficher. Lit d'abord le catalogue; si le produit n'y est plus (ancienne
 * commande), retombe sur les libellés enregistrés avec la commande, puis
 * sur les valeurs brutes.
 */
export function getVariantChips(
	line: LineLike,
	locale: StoreLocale,
	labelSource: "display" | "supplier" = "display",
): VariantChip[] {
	const fromCatalog = (line.product.variantGroups ?? [])
		.map((group): VariantChip | null => {
			const option = group.options.find(
				(item) => item.id === line.selectedOptions[group.id],
			);
			if (!option) {
				return null;
			}
			return {
				key: group.id,
				group: group.label[locale],
				label:
					(labelSource === "supplier" && option.supplierLabel) ||
					option.label[locale],
				swatchHex: group.type === "color" ? option.swatchHex : undefined,
			};
		})
		.filter((chip): chip is VariantChip => chip !== null);
	if (fromCatalog.length > 0) {
		return fromCatalog;
	}

	const fromSnapshot = Object.entries(line.selectedOptionLabels ?? {})
		.filter(([key, value]) => Boolean(key) && Boolean(value))
		.map(([key, value]) => ({ key, group: key, label: value }));
	if (fromSnapshot.length > 0) {
		return fromSnapshot;
	}

	return Object.entries(line.selectedOptions)
		.filter(([, value]) => Boolean(value))
		.map(([key, value]) => ({ key, group: key, label: value }));
}

export const formatVariantChips = (chips: VariantChip[]) =>
	chips.map((chip) => `${chip.group}: ${chip.label}`).join(" | ");
