import type { Edition } from "@/config/edition";
import { neonClient } from "@/lib/neon-client";

type EditionRow = {
	number: number;
	credit_per_employee: string | number | null;
	order_deadline: string | null;
	has_suppliers: boolean;
	is_open: boolean;
};

const EDITION_COLUMNS =
	"number,credit_per_employee,order_deadline,has_suppliers,is_open";

export const fetchEditions = async (): Promise<Edition[]> => {
	const result = await neonClient
		.from("editions")
		.select(EDITION_COLUMNS)
		.order("number", { ascending: true });
	if (result.error) {
		throw result.error;
	}
	return ((result.data ?? []) as EditionRow[]).map((row) => ({
		number: row.number,
		creditPerEmployee:
			row.credit_per_employee === null ? null : Number(row.credit_per_employee),
		orderDeadline: row.order_deadline,
		hasSuppliers: row.has_suppliers,
		isOpen: row.is_open,
	}));
};

const toEditionFields = (edition: Edition) => ({
	credit_per_employee: edition.creditPerEmployee,
	order_deadline: edition.orderDeadline,
	has_suppliers: edition.hasSuppliers,
	is_open: edition.isOpen,
});

export const createEdition = async (edition: Edition) => {
	const insertEdition = await neonClient
		.from("editions")
		.insert({ number: edition.number, ...toEditionFields(edition) });
	if (insertEdition.error) {
		throw insertEdition.error;
	}
	const closePreviousEditions = await neonClient
		.from("editions")
		.update({ is_open: false })
		.lt("number", edition.number);
	if (closePreviousEditions.error) {
		throw closePreviousEditions.error;
	}
};

export const updateEdition = async (edition: Edition) => {
	const result = await neonClient
		.from("editions")
		.update(toEditionFields(edition))
		.eq("number", edition.number);
	if (result.error) {
		throw result.error;
	}
};

export const deleteEdition = async (number: number) => {
	const result = await neonClient
		.from("editions")
		.delete()
		.eq("number", number);
	if (result.error) {
		throw result.error;
	}
};
