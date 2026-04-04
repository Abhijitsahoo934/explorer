import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 450,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@dnd-kit')) return 'vendor-dnd';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-3d';
          if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';

          return 'vendor-misc';
        },
      },
    },
  },
});
