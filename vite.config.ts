import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.DEPLOY_ENV === 'gh-pages' ? '/Site_botuvera/' : '/',
  plugins: [react(), tailwindcss()],
})
