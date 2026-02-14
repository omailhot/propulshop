// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { paraglideVitePlugin } from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/@inlang+paraglide-js@2.10.0/node_modules/@inlang/paraglide-js/dist/index.js";
import tailwindcss from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/@tailwindcss+vite@4.1.18/node_modules/@tailwindcss/vite/dist/index.mjs";
import { devtools } from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/@tanstack+devtools-vite@0.3.12/node_modules/@tanstack/devtools-vite/dist/esm/index.js";
import { tanstackStart } from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/@tanstack+react-start@1.159.0/node_modules/@tanstack/react-start/dist/esm/plugin/vite.js";
import viteReact from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/@vitejs+plugin-react@5.1.3/node_modules/@vitejs/plugin-react/dist/index.js";
import { nitro } from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/nitro-nightly@3.0.1-20260206-171553-bc737c0c/node_modules/nitro-nightly/dist/vite.mjs";
import { defineConfig } from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/vite@7.3.1_1/node_modules/vite/dist/node/index.js";
import viteTsConfigPaths from "file:///C:/Users/Olivier/Desktop/omailhot/node_modules/.deno/vite-tsconfig-paths@6.0.5/node_modules/vite-tsconfig-paths/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Olivier/Desktop/omailhot/vite.config.ts";
var config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["url"]
    }),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"]
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact()
  ]
});
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlUm9vdCI6ICJmaWxlOi8vL0M6L1VzZXJzL09saXZpZXIvRGVza3RvcC9vbWFpbGhvdC8iLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE9saXZpZXJcXFxcRGVza3RvcFxcXFxvbWFpbGhvdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcT2xpdmllclxcXFxEZXNrdG9wXFxcXG9tYWlsaG90XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9PbGl2aWVyL0Rlc2t0b3Avb21haWxob3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tIFwibm9kZTp1cmxcIjtcclxuaW1wb3J0IHsgcGFyYWdsaWRlVml0ZVBsdWdpbiB9IGZyb20gXCJAaW5sYW5nL3BhcmFnbGlkZS1qc1wiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xyXG5pbXBvcnQgeyBkZXZ0b29scyB9IGZyb20gXCJAdGFuc3RhY2svZGV2dG9vbHMtdml0ZVwiO1xyXG5pbXBvcnQgeyB0YW5zdGFja1N0YXJ0IH0gZnJvbSBcIkB0YW5zdGFjay9yZWFjdC1zdGFydC9wbHVnaW4vdml0ZVwiO1xyXG5pbXBvcnQgdml0ZVJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgeyBuaXRybyB9IGZyb20gXCJuaXRyby92aXRlXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB2aXRlVHNDb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xyXG5cclxuY29uc3QgY29uZmlnID0gZGVmaW5lQ29uZmlnKHtcclxuXHRyZXNvbHZlOiB7XHJcblx0XHRhbGlhczoge1xyXG5cdFx0XHRcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcblx0XHR9LFxyXG5cdH0sXHJcblx0cGx1Z2luczogW1xyXG5cdFx0ZGV2dG9vbHMoKSxcclxuXHRcdHBhcmFnbGlkZVZpdGVQbHVnaW4oe1xyXG5cdFx0XHRwcm9qZWN0OiBcIi4vcHJvamVjdC5pbmxhbmdcIixcclxuXHRcdFx0b3V0ZGlyOiBcIi4vc3JjL3BhcmFnbGlkZVwiLFxyXG5cdFx0XHRzdHJhdGVneTogW1widXJsXCJdLFxyXG5cdFx0fSksXHJcblx0XHRuaXRybygpLFxyXG5cdFx0Ly8gdGhpcyBpcyB0aGUgcGx1Z2luIHRoYXQgZW5hYmxlcyBwYXRoIGFsaWFzZXNcblx0XHR2aXRlVHNDb25maWdQYXRocyh7XHJcblx0XHRcdHByb2plY3RzOiBbXCIuL3RzY29uZmlnLmpzb25cIl0sXHJcblx0XHR9KSxcclxuXHRcdHRhaWx3aW5kY3NzKCksXHJcblx0XHR0YW5zdGFja1N0YXJ0KCksXHJcblx0XHR2aXRlUmVhY3QoKSxcclxuXHRdLFxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErUixTQUFTLGVBQWUsV0FBVztBQUNsVSxTQUFTLDJCQUEyQjtBQUNwQyxPQUFPLGlCQUFpQjtBQUN4QixTQUFTLGdCQUFnQjtBQUN6QixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLGVBQWU7QUFDdEIsU0FBUyxhQUFhO0FBQ3RCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sdUJBQXVCO0FBUnFKLElBQU0sMkNBQTJDO0FBVXBPLElBQU0sU0FBUyxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUNyRDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULG9CQUFvQjtBQUFBLE1BQ25CLFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSLFVBQVUsQ0FBQyxLQUFLO0FBQUEsSUFDakIsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBO0FBQUEsSUFFTixrQkFBa0I7QUFBQSxNQUNqQixVQUFVLENBQUMsaUJBQWlCO0FBQUEsSUFDN0IsQ0FBQztBQUFBLElBQ0QsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLEVBQ1g7QUFDRCxDQUFDO0FBRUQsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
