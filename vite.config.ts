import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/content': path.resolve(__dirname, 'dist/content')
    }
  },
  server: {
    // Serve content directory during development
    fs: {
      allow: ['..']
    }
  },
  build: {
    // Copy content files to build output
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    }
  }
})
