import type { StoreLocale } from "@/types/merch";

/**
 * Paramètres de l'édition en cours du Propulshop.
 *
 * C'est le SEUL endroit à modifier pour fixer le montant du crédit et la
 * date limite: les bannières, le panier, les infobulles et le tableau de
 * bord admin lisent tous ces valeurs.
 *
 * Tant qu'une valeur vaut `null`, elle est « À déterminer »: l'interface
 * l'écrit en toutes lettres et ne calcule rien à partir d'elle (aucun
 * crédit n'est appliqué au panier, aucun montant à payer n'est avancé).
 */
type Edition = {
	number: number;
	name: Record<StoreLocale, string>;
	ordinal: Record<StoreLocale, string>;
	/** Crédit offert par employé, en dollars canadiens. `null`: à déterminer. */
	creditPerEmployee: number | null;
	/**
	 * Date limite pour commander, ISO 8601 avec le décalage de Montréal,
	 * ex. "2026-12-15T23:59:59-05:00". `null`: à déterminer.
	 */
	orderDeadline: string | null;
};

export const EDITION: Edition = {
	number: 2,
	name: {
		fr: "Deuxième édition",
		en: "Second edition",
	},
	ordinal: {
		fr: "deuxième",
		en: "second",
	},

	// PLACEHOLDER: à déterminer. Remplacer `null` par le montant, ex. 200.
	creditPerEmployee: null,

	// PLACEHOLDER: à déterminer. Remplacer `null` par la date,
	// ex. "2026-12-15T23:59:59-05:00".
	orderDeadline: null,
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

export const getDeadlineDate = () => parseDate(EDITION.orderDeadline);

export const formatDeadlineLong = (locale: StoreLocale) =>
	formatDeadlineDate(EDITION.orderDeadline, locale, "long");

export const formatDeadlineShort = (locale: StoreLocale) =>
	formatDeadlineDate(EDITION.orderDeadline, locale, "short");

export const formatCredit = (locale: StoreLocale) =>
	formatCreditAmount(EDITION.creditPerEmployee, locale);
