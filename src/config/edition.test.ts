import { describe, expect, it } from "vitest";

import {
	EDITION,
	formatCredit,
	formatCreditAmount,
	formatDeadlineDate,
	formatDeadlineLong,
} from "@/config/edition";
import { merchCopy } from "@/config/merch-copy";
import { COMPANY_CREDIT, CREDIT_IS_SET } from "@/config/merch-store";

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

describe("the current edition", () => {
	it("never applies a credit that is not set", () => {
		if (EDITION.creditPerEmployee === null) {
			expect(CREDIT_IS_SET).toBe(false);
			expect(COMPANY_CREDIT).toBe(0);
			expect(formatCredit("fr")).toBeNull();
			expect(merchCopy.fr.policy).toContain("à déterminer");
			expect(merchCopy.fr.creditCommitteeTooltip).toContain("à déterminer");
		} else {
			expect(CREDIT_IS_SET).toBe(true);
			expect(COMPANY_CREDIT).toBe(EDITION.creditPerEmployee);
			expect(merchCopy.fr.policy).toContain(formatCredit("fr"));
		}
	});

	it("never prints a deadline that is not set", () => {
		if (EDITION.orderDeadline === null) {
			expect(formatDeadlineLong("fr")).toBeNull();
			expect(merchCopy.fr.placedPageBody).toContain("à déterminer");
			expect(merchCopy.fr.placedPageBody).not.toMatch(/null|undefined/);
		} else {
			expect(merchCopy.fr.placedPageBody).toContain(formatDeadlineLong("fr"));
		}
	});

	it("leaves no raw null in any text", () => {
		for (const locale of ["fr", "en"] as const) {
			for (const [key, value] of Object.entries(merchCopy[locale])) {
				if (typeof value === "string") {
					expect(value, `${locale}.${key}`).not.toMatch(/\bnull\b|undefined/);
				}
			}
		}
	});
});
