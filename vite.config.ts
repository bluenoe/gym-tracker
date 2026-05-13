import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import ở đây

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Cắm nó vào đây
  ],
})