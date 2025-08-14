import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/proyectoQR/' // deja esto así para GitHub Pages
})
