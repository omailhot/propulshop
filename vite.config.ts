import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, type Plugin } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

import { parseProductMarkdown } from "./src/lib/product-content";

const PRODUCT_FILE = /[\\/]content[\\/]products[\\/][^\\/]+\.md$/;

/**
 * Convertit chaque fiche produit (content/products/*.md) en module JS.
 * Une fiche invalide arrête la compilation
 * avec un message qui nomme le fichier et le champ fautif.
 */
const productMarkdown = (): Plugin => ({
	name: "propulshop:product-markdown",
	transform(code, id) {
		const [file] = id.split("?");
		if (!PRODUCT_FILE.test(file)) {
			return null;
		}
		const product = parseProductMarkdown(code, path.basename(file, ".md"));
		return {
			code: `export default ${JSON.stringify(product)};`,
			map: null,
		};
	},
});

const config = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		productMarkdown(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			strategy: ["url"],
		}),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		vue(),
	],
});

export default config;
