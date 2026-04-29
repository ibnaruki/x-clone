import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages deploy under /<repo-name>/, set VITE_BASE at build time.
// Locally, base is '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
});
