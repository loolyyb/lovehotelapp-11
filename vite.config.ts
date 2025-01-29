import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Use the correct options for @vitejs/plugin-react-swc
      swcOptions: {
        jsc: {
          transform: {
            react: {
              refresh: true,
              development: mode === 'development',
            },
          },
        },
      },
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Add extensions to improve module resolution
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  // Add better error reporting
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Improve HMR and error overlay
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}));