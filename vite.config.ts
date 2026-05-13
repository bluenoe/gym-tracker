import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // Import thêm cái này

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gym Minimalist Tracker',
        short_name: 'GymTrack',
        description: 'Tập trung vào luyện tập, không rườm rà.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone', // Quan trọng: Để app chạy full màn hình không có thanh địa chỉ
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})