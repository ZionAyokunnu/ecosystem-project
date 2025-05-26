import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        // run Vite on its default port so it never collides with the proxy
        port: 5173,
        host: 'localhost',
        proxy: {
          '/api': {
            target: 'http://localhost:8080', // llm‑proxy
            changeOrigin: true,
          },
        },
    },
    plugins: [
        react(),
        mode === 'development' &&
            componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            external: [],
        },
    },
    define: {
        // Force TypeScript to not emit declaration files
        __DEV__: mode === 'development',
    }
}));
