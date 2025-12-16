import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: true,
    strictPort: false,
    hmr: true,
    proxy: {
      '/api/uspto': {
        target: 'https://search.patentsview.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uspto/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Ross-AI-Legal-Platform/1.0'
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['lovable-tagger']
  },
  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-progress'
          ],
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'date-fns'
          ],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js', '@tanstack/react-query'],
          
          // App-specific chunks
          'billing-core': [
            '/src/services/billingService.ts',
            '/src/services/ledesBillingService.ts',
            '/src/types/billing.ts',
            '/src/types/ledes.ts'
          ],
          'billing-components': [
            '/src/components/billing/FloatingTimer.tsx',
            '/src/components/billing/TimeEntryGrid/',
            '/src/components/billing/NaturalTimeEntry.tsx',
            '/src/components/billing/WeeklyHeatMap.tsx'
          ]
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          
          // Special naming for lazy-loaded components
          if (facadeModuleId?.includes('Modal')) {
            return `modals/[name]-[hash].js`;
          }
          if (facadeModuleId?.includes('billing')) {
            return `billing/[name]-[hash].js`;
          }
          
          return `chunks/[name]-[hash].js`;
        },
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name?.toLowerCase() || '')) {
            return `fonts/[name]-[hash].${ext}`;
          }
          
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // Target modern browsers for better optimization
    target: 'es2020',
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable source maps in production for debugging (optional)
    sourcemap: mode === 'development',
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  }
}));