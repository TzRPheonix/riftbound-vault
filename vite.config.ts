import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
  },
  preview: {
    port: 4174,
    strictPort: false,
  },
});
