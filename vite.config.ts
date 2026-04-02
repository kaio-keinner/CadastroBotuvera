import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Ajustei para o nome do seu repositório no GitHub
  base: '/CadastroBotuvera/', 
  plugins: [react(), tailwindcss()],
})