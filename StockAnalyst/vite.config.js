import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Kita TIDAK butuh plugin tailwind disini karena sudah dihandle PostCSS
  ],
  server: {
    port: 7000, // Port Custom
  },
  build: {
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks untuk library besar
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log di production
        drop_debugger: true,
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // KB
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
})