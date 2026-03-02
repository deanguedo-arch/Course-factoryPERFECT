import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Course-factoryPERFECT/',  // ← MUST MATCH EXACTLY (case-sensitive!)
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return undefined;
          if (id.includes('/src/components/Phase1.jsx')) {
            return 'phase1';
          }
          if (id.includes('/src/components/modals/EditModal.jsx')) {
            return 'edit-modal';
          }
          if (id.includes('/src/components/composer/') || id.includes('/src/hooks/useComposer')) {
            return 'composer-ui';
          }
          if (id.includes('/src/composer/')) {
            return 'composer-core';
          }
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('react-grid-layout') || id.includes('react-resizable')) return 'composer-grid';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('/react-dom/') || id.includes('/react/')) return 'react-vendor';
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
})
