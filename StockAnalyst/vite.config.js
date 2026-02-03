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
  }
})