/**
 * Rendu markdown minimal pour les descriptions de produits: paragraphes,
 * listes à puces, **gras**, *italique* et [liens](https://...).
 * Tout le texte est échappé avant d'être balisé: le résultat peut être
 * passé à `v-html` sans risque d'injection.
 */

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

const renderInline = (value: string) =>
	escapeHtml(value)
		.replace(
			/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
		)
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");

const LIST_ITEM = /^\s*[-*]\s+(.*)$/;

export function renderMarkdown(source: string): string {
	const blocks = source
		.replace(/\r\n/g, "\n")
		.split(/\n{2,}/)
		.map((block) => block.trim())
		.filter(Boolean);

	return blocks
		.map((block) => {
			const lines = block.split("\n");
			if (lines.every((line) => LIST_ITEM.test(line))) {
				const items = lines
					.map((line) => `<li>${renderInline(LIST_ITEM.exec(line)?.[1] ?? "")}</li>`)
					.join("");
				return `<ul>${items}</ul>`;
			}
			return `<p>${lines.map(renderInline).join("<br />")}</p>`;
		})
		.join("");
}

/** Version texte brut, pour les aperçus tronqués des cartes. */
export function markdownToPlainText(source: string): string {
	return source
		.replace(/\r\n/g, "\n")
		.split("\n")
		.map((line) => {
			const item = LIST_ITEM.exec(line);
			const text = (item ? item[1] : line).trim();
			if (!text) {
				return "";
			}
			return item && !/[.!?:;]$/.test(text) ? `${text}.` : text;
		})
		.filter(Boolean)
		.join(" ")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1$2")
		.replace(/\s+/g, " ")
		.trim();
}
