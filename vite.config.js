import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'assets/romani-cafe-logo.png',
        'assets/apple-touch-icon.png',
        'assets/pwa-64x64.png',
      ],
      manifest: {
        id: '/menu',
        name: 'Romani Café — Cardápio',
        short_name: 'Romani Café',
        description: 'Cardápio semanal e gestão do buffet Romani Café.',
        lang: 'pt-BR',
        start_url: '/menu',
        scope: '/',
        display: 'standalone',
        background_color: '#fff8ee',
        theme_color: '#3b2021',
        categories: ['food', 'business'],
        icons: [
          {
            src: '/assets/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/assets/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/assets/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Cardápio de hoje',
            short_name: 'Cardápio',
            description: 'Abrir o cardápio do dia',
            url: '/menu',
            icons: [{ src: '/assets/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'romani-font-styles' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'romani-font-files',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
