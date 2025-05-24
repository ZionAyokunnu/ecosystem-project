
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
    // Disable declaration file generation during build
    rollupOptions: {
      external: [],
    },
  },
  esbuild: {
    // Configure esbuild to handle TypeScript without declaration files
    tsconfigRaw: {
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        composite: false,
      }
    }
  }
}));
