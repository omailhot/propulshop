import type { StoreLocale } from "@/types/merch";

/**
 * Paramètres de l'édition en cours du Shop Propulso.
 *
 * C'est le SEUL endroit à modifier pour changer le montant du crédit et la
 * date limite: les bannières, le panier, les infobulles et le tableau de
 * bord admin lisent tous ces valeurs.
 *
 * Tant qu'un drapeau `...IsPlaceholder` est à `true`, l'interface affiche
 * une pastille « À confirmer » à côté de la valeur. Le passer à `false`
 * une fois la valeur officielle saisie.
 */
export const EDITION = {
	number: 2,
	name: {
		fr: "Deuxième édition",
		en: "Second edition",
	},
	ordinal: {
		fr: "deuxième",
		en: "second",
	},

	/** PLACEHOLDER: crédit offert par employé, en dollars canadiens. */
	creditPerEmployee: 200,
	creditIsPlaceholder: true,

	/** PLACEHOLDER: date limite pour commander (ISO 8601, heure de Montréal). */
	orderDeadline: "2026-12-15T23:59:59-05:00",
	deadlineIsPlaceholder: true,
} as const;

const TIME_ZONE = "America/Toronto";

const intlLocale = (locale: StoreLocale) =>
	locale === "fr" ? "fr-CA" : "en-CA";

export const getDeadlineDate = () => new Date(EDITION.orderDeadline);

/** « 15 décembre 2026 » / "December 15, 2026" */
export const formatDeadlineLong = (locale: StoreLocale) => {
	const date = getDeadlineDate();
	const text = new Intl.DateTimeFormat(intlLocale(locale), {
		dateStyle: "long",
		timeZone: TIME_ZONE,
	}).format(date);
	return locale === "fr" ? text.replace(/^1 /, "1er ") : text;
};

/** « 15 décembre » / "December 15" */
export const formatDeadlineShort = (locale: StoreLocale) => {
	const date = getDeadlineDate();
	const text = new Intl.DateTimeFormat(intlLocale(locale), {
		day: "numeric",
		month: "long",
		timeZone: TIME_ZONE,
	}).format(date);
	return locale === "fr" ? text.replace(/^1 /, "1er ") : text;
};

/** « 200 $ » / "$200" */
export const formatCredit = (locale: StoreLocale) =>
	new Intl.NumberFormat(intlLocale(locale), {
		style: "currency",
		currency: "CAD",
		currencyDisplay: "narrowSymbol",
		maximumFractionDigits: 0,
	}).format(EDITION.creditPerEmployee);
