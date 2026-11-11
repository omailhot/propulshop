const SUPPLIER_DOTS = [
	"var(--p-orange)",
	"var(--p-bordeaux)",
	"var(--p-vert)",
	"var(--p-ocre)",
	"var(--p-encre)",
	"var(--p-braise)",
	"var(--p-filet-fort)",
];

export const UNSPECIFIED_SUPPLIER_DOT = "var(--p-encre-3)";

export const getSupplierName = (supplier: string | null | undefined) =>
	supplier || "Non précisé";

export const getSupplierDot = (
	supplier: string | null | undefined,
	suppliers: string[],
) => {
	const index = supplier ? suppliers.indexOf(supplier) : -1;
	return index === -1
		? UNSPECIFIED_SUPPLIER_DOT
		: SUPPLIER_DOTS[index % SUPPLIER_DOTS.length];
};
