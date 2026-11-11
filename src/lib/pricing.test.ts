import { describe, expect, it } from "vitest";

import { getPriceWithTaxes } from "@/lib/pricing";

describe("getPriceWithTaxes", () => {
	it("adds 14,975 % of taxes and rounds up to the next dollar", () => {
		expect(getPriceWithTaxes(22.5)).toBe(26);
		expect(getPriceWithTaxes(69.95)).toBe(81);
		expect(getPriceWithTaxes(0.28)).toBe(1);
	});

	it("leaves a free item free", () => {
		expect(getPriceWithTaxes(0)).toBe(0);
	});
});
