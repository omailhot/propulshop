import { describe, expect, it } from "vitest";

import {
	type Edition,
	formatCreditAmount,
	formatDeadlineDate,
	getEditionName,
	getEditionOrdinal,
	getNoOrderLabel,
	isDeadlinePassed,
	PENDING_EDITION,
	toDeadlineDateInput,
	toDeadlineIso,
} from "@/config/edition";
import { createMerchCopy } from "@/config/merch-copy";

const setEdition: Edition = {
	number: 2,
	creditPerEmployee: 200,
	orderDeadline: "2026-12-15T23:59:59-05:00",
	hasSuppliers: true,
	isOpen: true,
};

describe("formatCreditAmount", () => {
	it("formats a set amount without cents", () => {
		expect(formatCreditAmount(200, "fr")?.replace(/\s/g, " ")).toBe("200 $");
		expect(formatCreditAmount(200, "en")).toBe("$200");
	});

	it("returns null while the amount is to be determined", () => {
		expect(formatCreditAmount(null, "fr")).toBeNull();
	});
});

describe("formatDeadlineDate", () => {
	const iso = "2026-12-15T23:59:59-05:00";

	it("formats a set date in Montréal time", () => {
		expect(formatDeadlineDate(iso, "fr", "long")).toBe("15 décembre 2026");
		expect(formatDeadlineDate(iso, "fr", "short")).toBe("15 décembre");
		expect(formatDeadlineDate(iso, "en", "long")).toBe("December 15, 2026");
	});

	it("writes the first of the month the French way", () => {
		expect(formatDeadlineDate("2027-03-01T23:59:59-05:00", "fr", "short")).toBe(
			"1er mars",
		);
	});

	it("returns null while the date is to be determined or invalid", () => {
		expect(formatDeadlineDate(null, "fr", "long")).toBeNull();
		expect(formatDeadlineDate("pas une date", "fr", "long")).toBeNull();
	});
});

describe("edition names", () => {
	it("writes the ordinal in both languages", () => {
		expect(getEditionName(2, "fr")).toBe("Deuxième édition");
		expect(getEditionName(2, "en")).toBe("Second edition");
		expect(getNoOrderLabel(2, "fr")).toBe(
			"Aucune commande n'est placée pour la deuxième édition.",
		);
		expect(getEditionOrdinal(3, "fr")).toBe("troisième");
	});

	it("falls back to the number past the known ordinals", () => {
		expect(getEditionOrdinal(11, "fr")).toBe("11e");
	});
});

describe("the deadline date field", () => {
	it("turns a date into the end of that day in Montréal", () => {
		expect(toDeadlineIso("2026-12-15")).toBe("2026-12-16T04:59:59.000Z");
		expect(toDeadlineIso("2027-07-01")).toBe("2027-07-02T03:59:59.000Z");
	});

	it("reads the Montréal date back from a deadline", () => {
		expect(toDeadlineDateInput("2026-12-16T04:59:59.000Z")).toBe("2026-12-15");
		expect(toDeadlineDateInput(toDeadlineIso("2027-07-01"))).toBe("2027-07-01");
	});

	it("treats an empty field as to be determined", () => {
		expect(toDeadlineIso("")).toBeNull();
		expect(toDeadlineDateInput(null)).toBe("");
	});
});

describe("isDeadlinePassed", () => {
	it("is never passed while the deadline is to be determined", () => {
		expect(isDeadlinePassed(PENDING_EDITION)).toBe(false);
	});

	it("compares a set deadline with now", () => {
		expect(
			isDeadlinePassed({
				...setEdition,
				orderDeadline: "2020-01-01T00:00:00Z",
			}),
		).toBe(true);
		expect(
			isDeadlinePassed({
				...setEdition,
				orderDeadline: "2999-01-01T00:00:00Z",
			}),
		).toBe(false);
	});
});

describe("the texts of an edition", () => {
	it("never applies a credit or prints a deadline that is not set", () => {
		const copy = createMerchCopy(PENDING_EDITION).fr;
		expect(copy.policy).toContain("à déterminer");
		expect(copy.creditCommitteeTooltip).toContain("à déterminer");
		expect(copy.placedPageBody).toContain("à déterminer");
	});

	it("writes the credit and the deadline once they are set", () => {
		const copy = createMerchCopy(setEdition).fr;
		expect(copy.policy.replace(/\s/g, " ")).toContain("200 $");
		expect(copy.placedPageBody).toContain("15 décembre 2026");
		expect(copy.welcomeDescription).toBe("Deuxième édition, nouveau branding");
	});

	it("leaves no raw null in any text", () => {
		for (const edition of [PENDING_EDITION, setEdition]) {
			for (const locale of ["fr", "en"] as const) {
				for (const [key, value] of Object.entries(
					createMerchCopy(edition)[locale],
				)) {
					if (typeof value === "string") {
						expect(value, `${locale}.${key}`).not.toMatch(/\bnull\b|undefined/);
					}
				}
			}
		}
	});
});
