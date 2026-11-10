/**
 * Fournisseurs du Shop Propulso.
 *
 * Chaque produit (content/products/*.md) déclare son fournisseur avec la clé
 * `supplier`. Le mode admin s'en sert pour séparer le résumé de la commande
 * par fournisseur. Pour ajouter un fournisseur: ajouter une entrée ici, puis
 * l'utiliser dans les fichiers produits.
 */
export const SUPPLIERS = {
	printeez: {
		name: "Printeez",
		/** Couleur de la pastille (décorative: le nom reste toujours écrit). */
		dot: "var(--p-orange)",
	},
	"fournisseur-b": {
		/** PLACEHOLDER: remplacer par le vrai nom du deuxième fournisseur. */
		name: "Fournisseur B",
		dot: "var(--p-bordeaux)",
	},
} as const;

export type SupplierId = keyof typeof SUPPLIERS;

export const SUPPLIER_IDS = Object.keys(SUPPLIERS) as SupplierId[];

export const isSupplierId = (value: unknown): value is SupplierId =>
	typeof value === "string" && value in SUPPLIERS;

export const getSupplierName = (supplier: SupplierId | null | undefined) =>
	supplier ? SUPPLIERS[supplier].name : "Non précisé";
