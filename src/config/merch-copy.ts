import {
	EDITION,
	formatCredit,
	formatDeadlineLong,
	formatDeadlineShort,
} from "@/config/edition";
import type { Category, StoreLocale } from "@/types/merch";

/*
 * Le montant du crédit et la date limite viennent de config/edition.ts:
 * aucun texte ci-dessous ne les écrit en dur.
 */
const CREDIT = { fr: formatCredit("fr"), en: formatCredit("en") };
const DEADLINE = {
	fr: formatDeadlineLong("fr"),
	en: formatDeadlineLong("en"),
};
const DEADLINE_SHORT = {
	fr: formatDeadlineShort("fr"),
	en: formatDeadlineShort("en"),
};

/*
 * Tant qu'une valeur est « À déterminer » (null), chaque phrase a une
 * variante qui le dit clairement plutôt que d'afficher un montant ou une
 * date inventés.
 */
const withCredit = (
	locale: StoreLocale,
	known: (credit: string) => string,
	unknown: string,
) => {
	const credit = CREDIT[locale];
	return credit === null ? unknown : known(credit);
};
const withDeadline = (
	locale: StoreLocale,
	known: (short: string, long: string) => string,
	unknown: string,
) => {
	const short = DEADLINE_SHORT[locale];
	const long = DEADLINE[locale];
	return short === null || long === null ? unknown : known(short, long);
};

type LocalizedCategoryLabels = Record<"all" | Category, string>;

export type MerchCopy = {
	appTitle: string;
	appSubtitle: string;
	landingBadge: string;
	landingTitle: string;
	landingDescription: string;
	landingBullet1: string;
	landingBullet2: string;
	landingBullet3: string;
	landingCta: string;
	loginTitle: string;
	loginSubtitle: string;
	emailLabel: string;
	emailPlaceholder: string;
	signIn: string;
	connectGoogle: string;
	connecting: string;
	closeLogin: string;
	invalidEmail: string;
	invalidDomain: string;
	tabCatalog: string;
	tabProfile: string;
	catalogTitle: string;
	catalogSubtitle: string;
	search: string;
	resetCart: string;
	removeItem: string;
	viewDetails: string;
	quickAdd: string;
	addedToCart: string;
	perItem: string;
	quantity: string;
	variant: string;
	variants: string;
	noVariants: string;
	selectVariant: string;
	productDetails: string;
	addSelection: string;
	categoryLabels: LocalizedCategoryLabels;
	profileTitle: string;
	profileSubtitle: string;
	loggedInAs: string;
	logout: string;
	admin: string;
	backToCatalogShort: string;
	walletTitle: string;
	walletSubtitle: string;
	creditAvailable: string;
	creditUsed: string;
	creditRemaining: string;
	creditCommitteeTooltip: string;
	walletToPay: string;
	settingsTitle: string;
	settingOrderUpdates: string;
	settingDrops: string;
	cartBuilder: string;
	closeCart: string;
	items: string;
	emptyCart: string;
	addFromCatalog: string;
	subtotal: string;
	checkout: string;
	continueSelection: string;
	checkoutHint: string;
	reviewTitle: string;
	reviewSubtitle: string;
	itemsToOrder: string;
	confirmationTitle: string;
	confirmationSubtitle: string;
	confirmationText: string;
	invoiceLater: string;
	invoiceExplanation: string;
	backToCatalog: string;
	placeOrder: string;
	reopenOrder: string;
	modifyOrder: string;
	orderSent: string;
	orderAuthRequired: string;
	orderSendFailed: string;
	orderNoDraftStatus: string;
	orderPlacedStatus: string;
	orderLockedStatus: string;
	orderUnlockedStatus: string;
	deadlinePassed: string;
	cannotEditAfterDeadline: string;
	unlockBeforeEditing: string;
	lockOrder: string;
	unlockOrder: string;
	lockExplanationTitle: string;
	lockExplanationBody: string;
	lockDeadlineLabel: string;
	loggedOutBannerTitle: string;
	loggedOutBannerBody: string;
	existingOrderBannerTitle: string;
	viewMyOrder: string;
	placedPageTitle: string;
	placedPageBody: string;
	overwriteOrderPrompt: string;
	overwriteOrderAction: string;
	policy: string;
	viewOnlyEnable: string;
	viewOnlyDisable: string;
	viewOnlyBadge: string;
	viewOnlyBannerTitle: string;
	viewOnlyBannerBody: string;
	adminEmail: string;
	totalPerPerson: string;
	billablePerPerson: string;
	giftCardOutOfRange: string;
	giftCardQuantityLimit: string;
	giftCardLimitReached: string;
	welcomeEyebrow: string;
	welcomeTitle: string;
	welcomeBody: string;
	welcomeCreditLabel: string;
	welcomeCreditNote: string;
	welcomeDeadlineLabel: string;
	welcomeDeadlineNote: string;
	welcomeFinePrint: string;
	toBeDetermined: string;
	colorLabel: string;
	closeLabel: string;
	creditMeterLabel: string;
	addShort: string;
	addedShort: string;
	openCart: string;
	signInToOrder: string;
	categoryFilterLabel: string;
	creditRemainingShort: string;
};

export const merchCopy: Record<StoreLocale, MerchCopy> = {
	en: {
		appTitle: "Propulshop",
		appSubtitle: EDITION.name.en,
		landingBadge: "Modern Team Store",
		landingTitle: "Premium merch experience for every employee",
		landingDescription:
			"Choose products in real time, keep control of your budget, and submit one clean cart request.",
		landingBullet1: "Curated catalog with instant quantity updates",
		landingBullet2: "Company credit and wallet split always visible",
		landingBullet3: "Profile controls and notifications included",
		landingCta: "Access employee store",
		loginTitle: "Employee Login",
		loginSubtitle: "Use your Propulso e-mail to access the internal store.",
		emailLabel: "Work e-mail",
		emailPlaceholder: "name@propulso.io",
		signIn: "Sign in",
		connectGoogle: "Connect with Google",
		connecting: "Connecting...",
		closeLogin: "Close login",
		invalidEmail: "Please enter a valid e-mail address.",
		invalidDomain: "Use your @propulso.io e-mail to continue.",
		tabCatalog: "Catalog",
		tabProfile: "Profile",
		catalogTitle: "Catalog",
		catalogSubtitle: "Pick your merch items.",
		search: "Search products",
		resetCart: "Reset cart",
		removeItem: "Remove",
		viewDetails: "View details",
		quickAdd: "Quick add",
		addedToCart: "Added to cart",
		perItem: "per item",
		quantity: "Qty",
		variant: "Variant",
		variants: "Variants",
		noVariants: "Default option",
		selectVariant: "Select",
		productDetails: "Product details",
		addSelection: "Add selection",
		categoryLabels: {
			all: "All",
			wearables: "Wearables",
			desk: "Desk",
			travel: "Travel",
			lifestyle: "Lifestyle",
			giftcard: "Gift cards",
		},
		profileTitle: "User Profile",
		profileSubtitle: "Manage your account and wallet.",
		loggedInAs: "Logged in as",
		logout: "Logout",
		admin: "Admin",
		backToCatalogShort: "Catalog",
		walletTitle: "Wallet",
		walletSubtitle:
			"Propulso credit is applied first. Remaining amount is your personal payment.",
		creditAvailable: "Credit available",
		creditUsed: "Credit used",
		creditRemaining: "Credit remaining",
		creditCommitteeTooltip:
			withCredit(
				"en",
				(credit) =>
					`For this ${EDITION.ordinal.en} edition of the Propulshop, employees get up to ${credit} of store credit for Propulso merch. Any amount above this will be billed when the order is placed.`,
				`For this ${EDITION.ordinal.en} edition of the Propulshop, employees get store credit for Propulso merch. The credit amount is still to be determined. Any amount above it will be billed when the order is placed.`,
			),
		walletToPay: "From your wallet",
		settingsTitle: "Settings",
		settingOrderUpdates: "Order status e-mails",
		settingDrops: "Notify me about new drops",
		cartBuilder: "Cart",
		closeCart: "Close cart",
		items: "items",
		emptyCart: "Your cart is empty",
		addFromCatalog: "Add items from the catalog to build your cart.",
		subtotal: "Subtotal",
		checkout: "Submit order",
		continueSelection: "Go to confirmation page",
		checkoutHint:
			"Submitting sends your selected items to the internal merch order flow.",
		reviewTitle: "Order review",
		reviewSubtitle: "Verify selected items and quantities before confirming.",
		itemsToOrder: "Everything to order",
		confirmationTitle: "Confirmation",
		confirmationSubtitle: "Summary before final validation.",
		confirmationText:
			"Lock your cart to confirm your order. You can unlock it to make changes at any time before the deadline. Only the items of a locked order are included in the final order.",
		invoiceLater: "Amount invoiced later",
		invoiceExplanation:
			"Any amount exceeding company credit will be invoiced after internal approval.",
		backToCatalog: "Back to catalog",
		placeOrder: "Confirm selection",
		reopenOrder: "Re-open order",
		modifyOrder: "Modify order",
		orderSent: "Order sent successfully.",
		orderAuthRequired: "Please sign in before placing an order.",
		orderSendFailed: "Order could not be sent. Please try again.",
		orderNoDraftStatus: "No saved order yet.",
		orderPlacedStatus: "Order was placed on",
		orderLockedStatus: "Order is locked.",
		orderUnlockedStatus: "Order is unlocked.",
		deadlinePassed: withDeadline(
			"en",
			(short) => `The ${short} deadline has passed. Order is now placed.`,
			"The deadline has passed. Order is now placed.",
		),
		cannotEditAfterDeadline:
			withDeadline(
				"en",
				(short) =>
					`The ${short} deadline has passed. Your order can no longer be modified.`,
				"The deadline has passed. Your order can no longer be modified.",
			),
		unlockBeforeEditing: "Order is locked. Unlock it before editing.",
		lockOrder: "Lock order",
		unlockOrder: "Unlock order",
		lockExplanationTitle: "Lock-in before deadline",
		lockExplanationBody:
			withDeadline(
				"en",
				(short) =>
					`Lock your order before ${short}. If not locked, your current selection will still be placed automatically on ${short}.`,
				"Lock your order before the deadline, which is still to be determined.",
			),
		lockDeadlineLabel: "Deadline",
		loggedOutBannerTitle: "Sign in with your @propulso.io e-mail",
		loggedOutBannerBody:
			"Orders from non-Propulso accounts are not processed. Connect your Propulso account before submitting.",
		existingOrderBannerTitle: "You already have a locked order.",
		viewMyOrder: "View my order",
		placedPageTitle: "Order placed",
		placedPageBody:
			withDeadline(
				"en",
				(_short, long) =>
					`Your order is placed. You can unlock and modify your cart until ${long}.`,
				"Your order is placed. You can unlock and modify your cart until the deadline, which is still to be determined.",
			),
		overwriteOrderPrompt:
			"Do you want to overwrite your existing order or view it?",
		overwriteOrderAction: "Overwrite order",
		policy:
			withCredit(
				"en",
				(credit) =>
					`Propulso applies ${credit} credit first, then any remaining amount is paid from your personal wallet.`,
				"Propulso applies the social committee credit first (amount to be determined), then any remaining amount is paid from your personal wallet.",
			),
		viewOnlyEnable: "Enable read-only mode",
		viewOnlyDisable: "Disable read-only mode",
		viewOnlyBadge: "View-only mode enabled",
		viewOnlyBannerTitle: "Ordering is currently unavailable",
		viewOnlyBannerBody:
			"You can still view products, but ordering is disabled for now.",
		adminEmail: "Admin e-mail",
		totalPerPerson: "Total per person",
		billablePerPerson: "Billable",
		giftCardOutOfRange: "Gift card amount must be between $25 and $250.",
		giftCardQuantityLimit: "Limit: 1 per gift card",
		giftCardLimitReached:
			"This gift card is already in your cart. Maximum quantity is 1.",
		welcomeEyebrow: `${EDITION.name.en} · Social committee`,
		welcomeTitle: "The Propulshop",
		welcomeBody: `The social committee is proud to present the catalog for the ${EDITION.ordinal.en} edition of the Propulshop. Listed prices include taxes.`,
		welcomeCreditLabel: "Credit per employee",
		welcomeCreditNote: "Valid for this edition only",
		welcomeDeadlineLabel: "Order deadline",
		welcomeDeadlineNote: "Lock your order before this date",
		welcomeFinePrint:
			"Remaining credit cannot be carried over to the next edition, redeemed for cash or refunded.",
		toBeDetermined: "To be determined",
		colorLabel: "Color",
		closeLabel: "Close",
		creditMeterLabel: "Share of the credit used",
		addShort: "Add",
		addedShort: "In cart",
		openCart: "Open cart",
		signInToOrder: "Sign in with your @propulso.io account to confirm your order.",
		categoryFilterLabel: "Filter by category",
		creditRemainingShort: "Credit left",
	},
	fr: {
		appTitle: "Propulshop",
		appSubtitle: EDITION.name.fr,
		landingBadge: "Boutique équipe",
		landingTitle: "Expérience merch premium pour chaque employé",
		landingDescription:
			"Choisissez vos articles en temps réel, suivez votre budget et envoyez un panier clair.",
		landingBullet1: "Catalogue sélectif avec quantités en direct",
		landingBullet2:
			"Partage entre Crédit comité social et portefeuille toujours visible",
		landingBullet3: "Profil, préférences et notifications inclus",
		landingCta: "Accéder à la boutique employé",
		loginTitle: "Connexion employé",
		loginSubtitle:
			"Utilisez votre e-mail Propulso pour accéder à la boutique interne.",
		emailLabel: "E-mail propulso.io",
		emailPlaceholder: "name@propulso.io",
		signIn: "Se connecter",
		connectGoogle: "Se connecter avec Google",
		connecting: "Connexion...",
		closeLogin: "Fermer la connexion",
		invalidEmail: "Veuillez entrer une adresse e-mail valide.",
		invalidDomain: "Utilisez votre e-mail @propulso.io.",
		tabCatalog: "Catalogue",
		tabProfile: "Profil",
		catalogTitle: "Catalogue",
		catalogSubtitle: "Choisissez vos articles.",
		search: "Rechercher des produits",
		resetCart: "Vider le panier",
		removeItem: "Retirer",
		viewDetails: "Voir les détails",
		quickAdd: "Ajout rapide",
		addedToCart: "Ajouté au panier",
		perItem: "par article",
		quantity: "Quantité",
		variant: "Variante",
		variants: "Variantes",
		noVariants: "Option par défaut",
		selectVariant: "Choisir",
		productDetails: "Détails du produit",
		addSelection: "Ajouter la sélection",
		categoryLabels: {
			all: "Tous",
			wearables: "Vêtements",
			desk: "Bureau",
			travel: "Voyage",
			lifestyle: "Style de vie",
			giftcard: "Cartes-cadeaux",
		},
		profileTitle: "Profil utilisateur",
		profileSubtitle: "Gérez votre compte et votre portefeuille.",
		loggedInAs: "Connecté en tant que",
		logout: "Se déconnecter",
		admin: "Admin",
		backToCatalogShort: "Catalogue",
		walletTitle: "Portefeuille",
		walletSubtitle:
			"Le Crédit comité social est appliqué en premier. Le reste est à votre charge.",
		creditAvailable: "Crédit comité social disponible",
		creditUsed: "Crédit comité social utilisé",
		creditRemaining: "Crédit comité social restant",
		creditCommitteeTooltip:
			withCredit(
				"fr",
				(credit) =>
					`Pour cette ${EDITION.ordinal.fr} édition du Propulshop, nous offrons aux employés jusqu'à ${credit} de crédit magasin pour acheter des produits à l'effigie de Propulso. Le montant excédant sera facturé au moment de la commande.`,
				`Pour cette ${EDITION.ordinal.fr} édition du Propulshop, nous offrons aux employés un crédit magasin pour acheter des produits à l'effigie de Propulso. Le montant du crédit est à déterminer. Le montant excédant sera facturé au moment de la commande.`,
			),
		walletToPay: "Depuis votre portefeuille",
		settingsTitle: "Paramètres",
		settingOrderUpdates: "E-mails de statut de commande",
		settingDrops: "M'avertir des nouvelles collections",
		cartBuilder: "Panier",
		closeCart: "Fermer le panier",
		items: "articles",
		emptyCart: "Votre panier est vide",
		addFromCatalog:
			"Ajoutez des articles depuis le catalogue pour créer votre panier.",
		subtotal: "Sous-total",
		checkout: "Envoyer la commande",
		continueSelection: "Aller à la page de confirmation",
		checkoutHint:
			"L'envoi transmet les articles sélectionnés pour traitement de la commande interne.",
		reviewTitle: "Révision de commande",
		reviewSubtitle:
			"Vérifiez les articles et les quantités avant confirmation.",
		itemsToOrder: "Mon panier",
		confirmationTitle: "Confirmation de la commande",
		confirmationSubtitle: "Résumé avant la validation finale.",
		confirmationText: "Verrouillez votre panier pour confirmer votre commande. Vous pouvez à tout moment, avant la date limite, déverouiller votre commande pour la modifier. Seuls les articles d'une commande verrouillée seront considérés dans la commande finale.",
		invoiceLater: "Montant facturé plus tard",
		invoiceExplanation: "Tout montant au-delà du Crédit comité social vous sera facturé après approbation interne.",
		backToCatalog: "Retour au catalogue",
		placeOrder: "Confirmer la sélection",
		reopenOrder: "La commande a été réouverte.",
		modifyOrder: "Modifier la commande",
		orderSent: "Commande envoyée avec succès.",
		orderAuthRequired: "Veuillez vous connecter avant de passer une commande.",
		orderSendFailed: "La commande n'a pas pu être envoyée. Veuillez réessayer.",
		orderNoDraftStatus: "Aucune commande enregistrée pour le moment.",
		orderPlacedStatus: "Une commande a déjà été placée",
		orderLockedStatus: "La commande est verrouillée.",
		orderUnlockedStatus: "La commande est déverrouillée.",
		deadlinePassed:
			withDeadline(
				"fr",
				(short) =>
					`La date limite du ${short} est passée. La commande est maintenant placée.`,
				"La date limite est passée. La commande est maintenant placée.",
			),
		cannotEditAfterDeadline:
			withDeadline(
				"fr",
				(short) =>
					`La date limite du ${short} est passée. La commande ne peut plus être modifiée.`,
				"La date limite est passée. La commande ne peut plus être modifiée.",
			),
		unlockBeforeEditing:
			"La commande est verrouillée. Déverrouillez-la pour modifier.",
		lockOrder: "Verrouiller ma commande",
		unlockOrder: "Déverrouiller ma commande",
		lockExplanationTitle: "Verrouillage avant la date limite",
		lockExplanationBody:
			withDeadline(
				"fr",
				(short) =>
					`Verrouillez votre commande avant le ${short}. Si elle n'est pas verrouillée, la sélection actuelle sera quand même placée automatiquement le ${short}.`,
				"Verrouillez votre commande avant la date limite, qui reste à déterminer.",
			),
		lockDeadlineLabel: "Date limite",
		loggedOutBannerTitle: "Connectez-vous avec votre courriel @propulso.io",
		loggedOutBannerBody:
			"Les commandes provenant d'un autre compte ne seront pas traitées. Connectez votre compte Propulso avant l'envoi.",
		existingOrderBannerTitle: "Vous avez déjà une commande verrouillée.",
		viewMyOrder: "Voir ma commande",
		placedPageTitle: "Commande placée",
		placedPageBody:
			withDeadline(
				"fr",
				(_short, long) =>
					`Votre commande est placée. Vous pouvez la déverrouiller et modifier les articles du panier jusqu'au ${long}.`,
				"Votre commande est placée. Vous pouvez la déverrouiller et modifier les articles du panier jusqu'à la date limite, qui reste à déterminer.",
			),
		overwriteOrderPrompt:
			"Voulez-vous effacer votre commande existante ou la consulter?",
		overwriteOrderAction: "Effacer la commande",
		policy:
			withCredit(
				"fr",
				(credit) =>
					`Propulso applique d'abord ${credit} de Crédit comité social, puis la balance est payée depuis votre portefeuille personnel.`,
				"Propulso applique d'abord le Crédit comité social (montant à déterminer), puis la balance est payée depuis votre portefeuille personnel.",
			),
		viewOnlyEnable: "Activer lecture seule",
		viewOnlyDisable: "Désactiver lecture seule",
		viewOnlyBadge: "Mode lecture activé",
		viewOnlyBannerTitle: "Commande indisponible pour le moment",
		viewOnlyBannerBody:
			"Vous pouvez consulter les produits, mais il n'est pas possible de commander pour le moment.",
		adminEmail: "Courriel admin",
		totalPerPerson: "Total par personne",
		billablePerPerson: "Facturable",
		giftCardOutOfRange:
			"Le montant de carte cadeau doit être entre 25 $ et 250 $.",
		giftCardQuantityLimit: "Limite: 1 par carte-cadeau",
		giftCardLimitReached:
			"Cette carte-cadeau est déjà dans votre panier. La quantité maximale est 1.",
		welcomeEyebrow: `${EDITION.name.fr} · Comité social`,
		welcomeTitle: "Le Propulshop",
		welcomeBody: `Le comité social est fier de vous présenter le catalogue de la ${EDITION.ordinal.fr} édition du Propulshop. Les prix affichés comprennent les taxes.`,
		welcomeCreditLabel: "Crédit par employé",
		welcomeCreditNote: "Utilisable pour cette édition seulement",
		welcomeDeadlineLabel: "Date limite pour commander",
		welcomeDeadlineNote: "Verrouillez votre commande avant cette date",
		welcomeFinePrint:
			"Le crédit restant est non transférable à la prochaine édition, non monnayable et non remboursable.",
		toBeDetermined: "À déterminer",
		colorLabel: "Couleur",
		closeLabel: "Fermer",
		creditMeterLabel: "Part du crédit utilisée",
		addShort: "Ajouter",
		addedShort: "Dans le panier",
		openCart: "Ouvrir le panier",
		signInToOrder: "Connectez-vous avec votre compte @propulso.io pour confirmer votre commande.",
		categoryFilterLabel: "Filtrer par catégorie",
		creditRemainingShort: "Crédit restant",
	},
};
