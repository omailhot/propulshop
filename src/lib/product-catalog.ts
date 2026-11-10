import type { Product } from "../types/merch";

/**
 * Module volontairement sans dépendance: il est chargé dans le navigateur,
 * alors que le parseur des fiches (product-content.ts, qui dépend de `yaml`)
 * ne tourne qu'à la compilation.
 */

export type ParsedProduct = Product & {
	/** Position dans le catalogue (ordre croissant). */
	order: number;
};

/** Trie les produits et retire le champ `order`, propre au chargement. */
export function buildCatalog(parsed: ParsedProduct[]): Product[] {
	const seen = new Set<string>();
	for (const product of parsed) {
		if (seen.has(product.id)) {
			throw new Error(
				`[produits] l'identifiant « ${product.id} » est utilisé par deux fichiers.`,
			);
		}
		seen.add(product.id);
	}

	return [...parsed]
		.sort(
			(left, right) =>
				left.order - right.order ||
				left.name.fr.localeCompare(right.name.fr, "fr"),
		)
		.map(({ order: _order, ...product }) => product);
}
