import {
	type Edition,
	PENDING_EDITION,
	formatCreditAmount,
	formatDeadlineDate,
	getEditionName,
	getEditionOrdinal,
} from "@/config/edition";
import type { Category, StoreLocale } from "@/types/merch";

type LocalizedCategoryLabels = Record<"all" | Category, string>;

export type MerchCopy = {
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
	modifyOrder: string;
	orderSent: string;
	orderAuthRequired: string;
	orderSendFailed: string;
	deadlinePassed: string;
	cannotEditAfterDeadline: string;
	loggedOutBannerTitle: string;
	loggedOutBannerBody: string;
	existingOrderBannerTitle: string;
	viewMyOrder: string;
	placedPageTitle: string;
	placedPageBody: string;
	policy: string;
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
	welcomeDescription: string;
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
	orderUpdated: string;
	orderCancelled: string;
	orderEditStarted: string;
	orderPlacedOn: string;
	editingBannerTitle: string;
	editingBannerBody: string;
	cancelEdit: string;
	reviewChanges: string;
	saveOrderChanges: string;
	cancelOrder: string;
	cancelOrderHint: string;
	myOrders: string;
	currentEdition: string;
	catalogLoading: string;
	catalogUnavailable: string;
	catalogSignInRequired: string;
};

export const CATEGORY_LABELS: Record<StoreLocale, LocalizedCategoryLabels> = {
	en: {
		all: "All",
		wearables: "Wearables",
		desk: "Desk",
		travel: "Travel",
		lifestyle: "Lifestyle",
		giftcard: "Gift cards",
	},
	fr: {
		all: "Tous",
		wearables: "Vêtements",
		desk: "Bureau",
		travel: "Voyage",
		lifestyle: "Style de vie",
		giftcard: "Cartes-cadeaux",
	},
};

export const createMerchCopy = (
	edition: Edition,
): Record<StoreLocale, MerchCopy> => {
	const isPending = edition.number === PENDING_EDITION.number;
	const credit = {
		fr: formatCreditAmount(edition.creditPerEmployee, "fr"),
		en: formatCreditAmount(edition.creditPerEmployee, "en"),
	};
	const deadlineLong = {
		fr: formatDeadlineDate(edition.orderDeadline, "fr", "long"),
		en: formatDeadlineDate(edition.orderDeadline, "en", "long"),
	};
	const deadlineShort = {
		fr: formatDeadlineDate(edition.orderDeadline, "fr", "short"),
		en: formatDeadlineDate(edition.orderDeadline, "en", "short"),
	};
	const withCredit = (
		locale: StoreLocale,
		known: (credit: string) => string,
		unknown: string,
	) => {
		const amount = credit[locale];
		return amount === null ? unknown : known(amount);
	};
	const withDeadline = (
		locale: StoreLocale,
		known: (short: string, long: string) => string,
		unknown: string,
	) => {
		const short = deadlineShort[locale];
		const long = deadlineLong[locale];
		return short === null || long === null ? unknown : known(short, long);
	};

	return {
		en: {
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
			categoryLabels: CATEGORY_LABELS.en,
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
			creditCommitteeTooltip: withCredit(
				"en",
				(credit) =>
					`For this ${getEditionOrdinal(edition.number, "en")} edition of the Propulshop, employees get up to ${credit} of store credit for Propulso merch. Any amount above this will be billed when the order is placed.`,
				`For this ${getEditionOrdinal(edition.number, "en")} edition of the Propulshop, employees get store credit for Propulso merch. The credit amount is still to be determined. Any amount above it will be billed when the order is placed.`,
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
				"Place your order to confirm it. You can modify it at any time before the deadline. Only the items of a placed order are included in the final order.",
			invoiceLater: "Amount invoiced later",
			invoiceExplanation:
				"Any amount exceeding company credit will be invoiced after internal approval.",
			backToCatalog: "Back to catalog",
			placeOrder: "Place my order",
			modifyOrder: "Modify order",
			orderSent: "Order sent successfully.",
			orderAuthRequired: "Please sign in before placing an order.",
			orderSendFailed: "Order could not be sent. Please try again.",
			deadlinePassed: withDeadline(
				"en",
				(short) => `The ${short} deadline has passed. Order is now placed.`,
				"The deadline has passed. Order is now placed.",
			),
			cannotEditAfterDeadline: withDeadline(
				"en",
				(short) =>
					`The ${short} deadline has passed. Your order can no longer be modified.`,
				"The deadline has passed. Your order can no longer be modified.",
			),
			loggedOutBannerTitle: "Sign in with your @propulso.io e-mail",
			loggedOutBannerBody:
				"Orders from non-Propulso accounts are not processed.",
			existingOrderBannerTitle: "Your order is placed.",
			viewMyOrder: "View my order",
			placedPageTitle: "Order placed",
			placedPageBody: withDeadline(
				"en",
				(_short, long) =>
					`Your order is placed. You can modify it until ${long}.`,
				"Your order is placed. You can modify it until the deadline, which is still to be determined.",
			),
			policy: withCredit(
				"en",
				(credit) =>
					`Propulso applies ${credit} credit first, then any remaining amount is paid from your personal wallet.`,
				"Propulso applies the social committee credit first (amount to be determined), then any remaining amount is paid from your personal wallet.",
			),
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
			welcomeEyebrow: `${getEditionName(edition.number, "en")} · Social committee`,
			welcomeDescription: isPending
				? ""
				: `${getEditionName(edition.number, "en")}, new branding`,
			welcomeBody: `The social committee is proud to present the catalog for the ${getEditionOrdinal(edition.number, "en")} edition of the Propulshop. Listed prices include taxes.`,
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
			signInToOrder:
				"Sign in with your @propulso.io account to confirm your order.",
			categoryFilterLabel: "Filter by category",
			creditRemainingShort: "Credit left",
			orderUpdated: "Order updated.",
			orderCancelled: "Order cancelled.",
			orderEditStarted:
				"You are modifying your order. Save your changes for them to count.",
			orderPlacedOn: "Placed on",
			editingBannerTitle: "Changes in progress",
			editingBannerBody:
				"Your changes are not saved yet. Your placed order stays as it is until you save them.",
			cancelEdit: "Discard changes",
			reviewChanges: "Review and save",
			saveOrderChanges: "Save changes",
			cancelOrder: "Cancel my order",
			cancelOrderHint: "If you confirm, your placed order will be cancelled.",
			myOrders: "My orders",
			currentEdition: "Current edition",
			catalogLoading: "Loading the catalog...",
			catalogUnavailable: "The catalog could not be loaded. Try again later.",
			catalogSignInRequired: "Sign in to see the catalog.",
		},
		fr: {
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
			categoryLabels: CATEGORY_LABELS.fr,
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
			creditCommitteeTooltip: withCredit(
				"fr",
				(credit) =>
					`Pour cette ${getEditionOrdinal(edition.number, "fr")} édition du Propulshop, nous offrons aux employés jusqu'à ${credit} de crédit magasin pour acheter des produits à l'effigie de Propulso. Le montant excédant sera facturé au moment de la commande.`,
				`Pour cette ${getEditionOrdinal(edition.number, "fr")} édition du Propulshop, nous offrons aux employés un crédit magasin pour acheter des produits à l'effigie de Propulso. Le montant du crédit est à déterminer. Le montant excédant sera facturé au moment de la commande.`,
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
			confirmationText:
				"Placez votre commande pour la confirmer. Vous pouvez la modifier à tout moment avant la date limite. Seuls les articles d'une commande placée seront considérés dans la commande finale.",
			invoiceLater: "Montant facturé plus tard",
			invoiceExplanation:
				"Tout montant au-delà du Crédit comité social vous sera facturé après approbation interne.",
			backToCatalog: "Retour au catalogue",
			placeOrder: "Placer ma commande",
			modifyOrder: "Modifier la commande",
			orderSent: "Commande envoyée avec succès.",
			orderAuthRequired:
				"Veuillez vous connecter avant de passer une commande.",
			orderSendFailed:
				"La commande n'a pas pu être envoyée. Veuillez réessayer.",
			deadlinePassed: withDeadline(
				"fr",
				(short) =>
					`La date limite du ${short} est passée. La commande est maintenant placée.`,
				"La date limite est passée. La commande est maintenant placée.",
			),
			cannotEditAfterDeadline: withDeadline(
				"fr",
				(short) =>
					`La date limite du ${short} est passée. La commande ne peut plus être modifiée.`,
				"La date limite est passée. La commande ne peut plus être modifiée.",
			),
			loggedOutBannerTitle: "Connectez-vous avec votre courriel @propulso.io",
			loggedOutBannerBody:
				"Les commandes provenant d'un autre compte ne seront pas traitées.",
			existingOrderBannerTitle: "Votre commande est placée.",
			viewMyOrder: "Voir ma commande",
			placedPageTitle: "Commande placée",
			placedPageBody: withDeadline(
				"fr",
				(_short, long) =>
					`Votre commande est placée. Vous pouvez la modifier jusqu'au ${long}.`,
				"Votre commande est placée. Vous pouvez la modifier jusqu'à la date limite, qui reste à déterminer.",
			),
			policy: withCredit(
				"fr",
				(credit) =>
					`Propulso applique d'abord ${credit} de Crédit comité social, puis la balance est payée depuis votre portefeuille personnel.`,
				"Propulso applique d'abord le Crédit comité social (montant à déterminer), puis la balance est payée depuis votre portefeuille personnel.",
			),
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
			welcomeEyebrow: `${getEditionName(edition.number, "fr")} · Comité social`,
			welcomeDescription: isPending
				? ""
				: `${getEditionName(edition.number, "fr")}, nouveau branding`,
			welcomeBody: `Le comité social est fier de vous présenter le catalogue de la ${getEditionOrdinal(edition.number, "fr")} édition du Propulshop. Les prix affichés comprennent les taxes.`,
			welcomeCreditLabel: "Crédit par employé",
			welcomeCreditNote: "Utilisable pour cette édition seulement",
			welcomeDeadlineLabel: "Date limite",
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
			signInToOrder:
				"Connectez-vous avec votre compte @propulso.io pour confirmer votre commande.",
			categoryFilterLabel: "Filtrer par catégorie",
			creditRemainingShort: "Crédit restant",
			orderUpdated: "Commande mise à jour.",
			orderCancelled: "Commande annulée.",
			orderEditStarted:
				"Vous modifiez votre commande. Enregistrez vos modifications pour qu'elles comptent.",
			orderPlacedOn: "Placée le",
			editingBannerTitle: "Modification en cours",
			editingBannerBody:
				"Vos changements ne sont pas encore enregistrés. Votre commande placée reste telle quelle d'ici là.",
			cancelEdit: "Annuler les modifications",
			reviewChanges: "Revoir et enregistrer",
			saveOrderChanges: "Enregistrer les modifications",
			cancelOrder: "Annuler ma commande",
			cancelOrderHint: "Si vous confirmez, votre commande placée sera annulée.",
			myOrders: "Mes commandes",
			currentEdition: "Édition en cours",
			catalogLoading: "Chargement du catalogue...",
			catalogUnavailable:
				"Le catalogue n'a pas pu être chargé. Réessayez plus tard.",
			catalogSignInRequired: "Connectez-vous pour voir le catalogue.",
		},
	};
};
