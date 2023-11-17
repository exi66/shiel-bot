import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: '/src/main.js',
      output: {
        entryFileNames: `app/assets/[name].js`,
        chunkFileNames: `app/assets/[name].js`,
        assetFileNames: `app/assets/[name].[ext]`
      }
    }
  }
})
