import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const norm = id.replace(/\\/g, '/');
          if (!norm.includes('/node_modules/')) return undefined;
          if (norm.includes('/@dimforge/rapier') || norm.includes('/@react-three/rapier')) {
            return 'vendor-rapier';
          }
          if (
            norm.includes('/@react-three/') ||
            norm.includes('/three-stdlib/') ||
            norm.includes('/troika-')
          ) {
            return 'vendor-r3f';
          }
          if (norm.includes('/three/')) {
            return 'vendor-three';
          }
          if (
            norm.includes('/react-dom/') ||
            norm.includes('/react/') ||
            norm.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }
          return undefined;
        },
      },
    },
  },
});
