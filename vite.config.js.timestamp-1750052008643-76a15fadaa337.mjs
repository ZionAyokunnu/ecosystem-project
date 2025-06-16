// vite.config.js
import { defineConfig } from "file:///Users/zionayokunnu/Desktop/ECOSYSTEM%20REMINDER/App/ecosystem-project/node_modules/vite/dist/node/index.js";
import react from "file:///Users/zionayokunnu/Desktop/ECOSYSTEM%20REMINDER/App/ecosystem-project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///Users/zionayokunnu/Desktop/ECOSYSTEM%20REMINDER/App/ecosystem-project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/Users/zionayokunnu/Desktop/ECOSYSTEM REMINDER/App/ecosystem-project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    // run Vite on its default port so it never collides with the proxy
    port: 5173,
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        // llm‑proxy
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      external: []
    }
  },
  define: {
    // Force TypeScript to not emit declaration files
    __DEV__: mode === "development"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvemlvbmF5b2t1bm51L0Rlc2t0b3AvRUNPU1lTVEVNIFJFTUlOREVSL0FwcC9lY29zeXN0ZW0tcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3ppb25heW9rdW5udS9EZXNrdG9wL0VDT1NZU1RFTSBSRU1JTkRFUi9BcHAvZWNvc3lzdGVtLXByb2plY3Qvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3ppb25heW9rdW5udS9EZXNrdG9wL0VDT1NZU1RFTSUyMFJFTUlOREVSL0FwcC9lY29zeXN0ZW0tcHJvamVjdC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gICAgc2VydmVyOiB7XG4gICAgICAgIC8vIHJ1biBWaXRlIG9uIGl0cyBkZWZhdWx0IHBvcnQgc28gaXQgbmV2ZXIgY29sbGlkZXMgd2l0aCB0aGUgcHJveHlcbiAgICAgICAgcG9ydDogNTE3MyxcbiAgICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwODAnLCAvLyBsbG1cdTIwMTFwcm94eVxuICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIHJlYWN0KCksXG4gICAgICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICAgICAgICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgZXh0ZXJuYWw6IFtdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAgIC8vIEZvcmNlIFR5cGVTY3JpcHQgdG8gbm90IGVtaXQgZGVjbGFyYXRpb24gZmlsZXNcbiAgICAgICAgX19ERVZfXzogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICB9XG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdZLFNBQVMsb0JBQW9CO0FBQzdaLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN2QyxRQUFRO0FBQUE7QUFBQSxJQUVKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ0wsZ0JBQWdCO0FBQUEsRUFDeEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDeEM7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDWCxVQUFVLENBQUM7QUFBQSxJQUNmO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUEsSUFFSixTQUFTLFNBQVM7QUFBQSxFQUN0QjtBQUNKLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
