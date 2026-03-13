// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { paraglideVitePlugin } from "file:///C:/Users/Olivier/Desktop/propulshop/node_modules/.deno/@inlang+paraglide-js@2.10.0/node_modules/@inlang/paraglide-js/dist/index.js";
import tailwindcss from "file:///C:/Users/Olivier/Desktop/propulshop/node_modules/.deno/@tailwindcss+vite@4.1.18/node_modules/@tailwindcss/vite/dist/index.mjs";
import vue from "file:///C:/Users/Olivier/Desktop/propulshop/node_modules/.deno/@vitejs+plugin-vue@6.0.4/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { defineConfig } from "file:///C:/Users/Olivier/Desktop/propulshop/node_modules/.deno/vite@7.3.1/node_modules/vite/dist/node/index.js";
import viteTsConfigPaths from "file:///C:/Users/Olivier/Desktop/propulshop/node_modules/.deno/vite-tsconfig-paths@6.0.5/node_modules/vite-tsconfig-paths/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Olivier/Desktop/propulshop/vite.config.ts";
var config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["url"]
    }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"]
    }),
    tailwindcss(),
    vue()
  ]
});
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlUm9vdCI6ICJmaWxlOi8vL0M6L1VzZXJzL09saXZpZXIvRGVza3RvcC9wcm9wdWxzaG9wLyIsCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcT2xpdmllclxcXFxEZXNrdG9wXFxcXHByb3B1bHNob3BcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE9saXZpZXJcXFxcRGVza3RvcFxcXFxwcm9wdWxzaG9wXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9PbGl2aWVyL0Rlc2t0b3AvcHJvcHVsc2hvcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gXCJub2RlOnVybFwiO1xyXG5cclxuaW1wb3J0IHsgcGFyYWdsaWRlVml0ZVBsdWdpbiB9IGZyb20gXCJAaW5sYW5nL3BhcmFnbGlkZS1qc1wiO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcIkB0YWlsd2luZGNzcy92aXRlXCI7XHJcbmltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgdml0ZVRzQ29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcclxuXHJcbmNvbnN0IGNvbmZpZyA9IGRlZmluZUNvbmZpZyh7XHJcblx0cmVzb2x2ZToge1xyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0XCJAXCI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vc3JjXCIsIGltcG9ydC5tZXRhLnVybCkpLFxyXG5cdFx0fSxcclxuXHR9LFxyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHBhcmFnbGlkZVZpdGVQbHVnaW4oe1xyXG5cdFx0XHRwcm9qZWN0OiBcIi4vcHJvamVjdC5pbmxhbmdcIixcclxuXHRcdFx0b3V0ZGlyOiBcIi4vc3JjL3BhcmFnbGlkZVwiLFxyXG5cdFx0XHRzdHJhdGVneTogW1widXJsXCJdLFxyXG5cdFx0fSksXHJcblx0XHR2aXRlVHNDb25maWdQYXRocyh7XHJcblx0XHRcdHByb2plY3RzOiBbXCIuL3RzY29uZmlnLmpzb25cIl0sXHJcblx0XHR9KSxcclxuXHRcdHRhaWx3aW5kY3NzKCksXHJcblx0XHR2dWUoKSxcclxuXHRdLFxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxUyxTQUFTLGVBQWUsV0FBVztBQUV4VSxTQUFTLDJCQUEyQjtBQUNwQyxPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFNBQVM7QUFDaEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyx1QkFBdUI7QUFOeUosSUFBTSwyQ0FBMkM7QUFReE8sSUFBTSxTQUFTLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3JEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1Isb0JBQW9CO0FBQUEsTUFDbkIsU0FBUztBQUFBLE1BQ1QsUUFBUTtBQUFBLE1BQ1IsVUFBVSxDQUFDLEtBQUs7QUFBQSxJQUNqQixDQUFDO0FBQUEsSUFDRCxrQkFBa0I7QUFBQSxNQUNqQixVQUFVLENBQUMsaUJBQWlCO0FBQUEsSUFDN0IsQ0FBQztBQUFBLElBQ0QsWUFBWTtBQUFBLElBQ1osSUFBSTtBQUFBLEVBQ0w7QUFDRCxDQUFDO0FBRUQsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
