import { resolveImageSrc } from "@/lib/image-store";
import type { ProductImage } from "@/types/merch";

type WithImages = {
	images?: ProductImage[];
};

/**
 * Les images à montrer pour une sélection donnée (couleur, visuel, etc.).
 *
 * Une image est retenue si rien dans son `when` ne contredit la sélection.
 * Celles qui illustrent le plus précisément la sélection passent en premier,
 * suivies des images communes (photo portée, guide des tailles). Les images
 * d'une autre couleur sont écartées.
 */
export function getImagesForSelection(
	product: WithImages,
	selectedOptions: Record<string, string> = {},
): string[] {
	const images = product.images;
	if (!images || images.length === 0) {
		return [];
	}

	const ranked = images
		.map((image, index) => {
			let score = 0;
			for (const [groupId, optionId] of Object.entries(image.when ?? {})) {
				const selected = selectedOptions[groupId];
				if (!selected) {
					continue;
				}
				if (selected !== optionId) {
					return null;
				}
				score += 1;
			}
			return { src: image.src, score, index };
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
		.sort((left, right) => right.score - left.score || left.index - right.index);

	if (ranked.length === 0) {
		return images.map((image) => resolveImageSrc(image.src));
	}
	return ranked.map((entry) => resolveImageSrc(entry.src));
}

export const getPrimaryImage = (
	product: WithImages,
	selectedOptions: Record<string, string> = {},
) => getImagesForSelection(product, selectedOptions)[0] ?? null;
