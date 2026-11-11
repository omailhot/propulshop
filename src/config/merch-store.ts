import { EDITION } from "@/config/edition";
import { buildCatalog, type ParsedProduct } from "@/lib/product-catalog";
import type { Category, Product } from "@/types/merch";

/**
 * Le crédit est-il fixé? Tant que non (« À déterminer »), aucun crédit n'est
 * appliqué et l'interface n'avance aucun montant qui en dépend.
 */
export const CREDIT_IS_SET: boolean = EDITION.creditPerEmployee !== null;

/** Crédit offert par employé pour l'édition en cours (voir config/edition.ts). */
export const COMPANY_CREDIT: number = EDITION.creditPerEmployee ?? 0;

export const categoryOrder: Array<"all" | Category> = [
	"all",
	"wearables",
	"desk",
	"travel",
	"lifestyle",
	"giftcard",
];

/*
 * Le catalogue vit dans content/products/*.md: un fichier par produit,
 * frontmatter YAML pour les données, corps markdown pour la description.
 * Les fichiers sont validés et convertis à la compilation par le plugin
 * `propulshop:product-markdown` (vite.config.ts). Voir content/README.md.
 */
const productModules = import.meta.glob<ParsedProduct>(
	"/content/products/*.md",
	{ eager: true, import: "default" },
);

export const products: Product[] = buildCatalog(Object.values(productModules));
