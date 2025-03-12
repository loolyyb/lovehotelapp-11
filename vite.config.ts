
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const isPreview = process.env.LOVABLE_ENV === 'preview';
  
  // Generate base path for assets
  let basePath = '/';
  if (isPreview && process.env.PREVIEW_ID) {
    basePath = `/${process.env.PREVIEW_ID}/`;
    console.log('Using preview base path:', basePath);
  }
  
  return {
    base: basePath,
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
    optimizeDeps: {
      include: ['crypto-js']
    },
    build: {
      commonjsOptions: {
        include: [/crypto-js/, /node_modules/]
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: [
              '@radix-ui/react-avatar', 
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs'
            ],
          }
        }
      }
    }
  };
});
