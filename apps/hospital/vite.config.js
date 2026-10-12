import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3004,
    strictPort: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
