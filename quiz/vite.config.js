import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // Use Vite's default esbuild minifier (no terser needed)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Firebase excluded is optional; remove exclude if causing issues
  },
})
