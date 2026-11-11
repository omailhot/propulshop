import type { StoreLocale } from "@/types/merch";

export type Edition = {
	number: number;
	creditPerEmployee: number | null;
	orderDeadline: string | null;
	hasSuppliers: boolean;
	isOpen: boolean;
};

export const PENDING_EDITION: Edition = {
	number: 0,
	creditPerEmployee: null,
	orderDeadline: null,
	hasSuppliers: true,
	isOpen: false,
};

const ORDINALS: Record<StoreLocale, string[]> = {
	fr: [
		"première",
		"deuxième",
		"troisième",
		"quatrième",
		"cinquième",
		"sixième",
		"septième",
		"huitième",
		"neuvième",
		"dixième",
	],
	en: [
		"first",
		"second",
		"third",
		"fourth",
		"fifth",
		"sixth",
		"seventh",
		"eighth",
		"ninth",
		"tenth",
	],
};

export const getEditionOrdinal = (number: number, locale: StoreLocale) =>
	ORDINALS[locale][number - 1] ??
	(locale === "fr" ? `${number}e` : `#${number}`);

export const getEditionName = (number: number, locale: StoreLocale) => {
	const ordinal = getEditionOrdinal(number, locale);
	const capitalized = ordinal.charAt(0).toUpperCase() + ordinal.slice(1);
	return locale === "fr" ? `${capitalized} édition` : `${capitalized} edition`;
};

const TIME_ZONE = "America/Toronto";

const intlLocale = (locale: StoreLocale) =>
	locale === "fr" ? "fr-CA" : "en-CA";

const parseDate = (iso: string | null) => {
	if (!iso) {
		return null;
	}
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date;
};

/** « 200 $ » / "$200". `null` tant que le montant est à déterminer. */
export const formatCreditAmount = (
	amount: number | null,
	locale: StoreLocale,
) =>
	amount === null
		? null
		: new Intl.NumberFormat(intlLocale(locale), {
				style: "currency",
				currency: "CAD",
				currencyDisplay: "narrowSymbol",
				maximumFractionDigits: 0,
			}).format(amount);

/**
 * « 15 décembre 2026 » (long) ou « 15 décembre » (short).
 * `null` tant que la date est à déterminer.
 */
export const formatDeadlineDate = (
	iso: string | null,
	locale: StoreLocale,
	style: "long" | "short",
) => {
	const date = parseDate(iso);
	if (!date) {
		return null;
	}
	const text = new Intl.DateTimeFormat(intlLocale(locale), {
		day: "numeric",
		month: "long",
		...(style === "long" ? { year: "numeric" as const } : {}),
		timeZone: TIME_ZONE,
	}).format(date);
	return locale === "fr" ? text.replace(/^1 /, "1er ") : text;
};

const getTimeZoneOffsetMs = (date: Date) => {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-CA", {
			timeZone: TIME_ZONE,
			hourCycle: "h23",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
			.formatToParts(date)
			.map((part) => [part.type, Number(part.value)]),
	);
	return (
		Date.UTC(
			parts.year,
			parts.month - 1,
			parts.day,
			parts.hour,
			parts.minute,
			parts.second,
		) - date.getTime()
	);
};

export const toDeadlineIso = (dateInput: string) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput);
	if (!match) {
		return null;
	}
	const [year, month, day] = match.slice(1).map(Number);
	const wallTime = Date.UTC(year, month - 1, day, 23, 59, 59);
	return new Date(
		wallTime - getTimeZoneOffsetMs(new Date(wallTime)),
	).toISOString();
};

export const toDeadlineDateInput = (iso: string | null) => {
	const date = parseDate(iso);
	return date
		? new Intl.DateTimeFormat("en-CA", {
				timeZone: TIME_ZONE,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}).format(date)
		: "";
};

export const isDeadlinePassed = (edition: Edition) => {
	const deadline = parseDate(edition.orderDeadline);
	return deadline ? Date.now() >= deadline.getTime() : false;
};
