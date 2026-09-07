import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('./frontend', import.meta.url));
const logo = fileURLToPath(new URL('./frontend/public/assets/mymatchiq-logo.png', import.meta.url));
const hero = fileURLToPath(new URL('./frontend/public/assets/mymatchiq-hero-bg.png', import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: {
      'figma:asset/e59cdf8a52814bfc4e60ccc52f8cdfd978064d6e.png': logo,
      'figma:asset/a62c2c040c06dcf93d9c78587e391fcc95887294.png': hero,
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
});
