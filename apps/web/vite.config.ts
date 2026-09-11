/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// apps/mobile pulls in React 19 which npm hoists to the workspace root, while
// this app is on React 18. Pin every React import to this app's single copy —
// otherwise elements created against the other copy fail the $$typeof check
// ("Objects are not valid as a React child", hit via hoisted lucide-react).
const reactPath = fileURLToPath(new URL('./node_modules/react', import.meta.url));
const reactDomPath = fileURLToPath(new URL('./node_modules/react-dom', import.meta.url));

export default defineConfig({
  base: '/gym-tracker-app/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: reactPath,
      'react-dom': reactDomPath,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    // lucide-react is hoisted to the workspace root next to React 19, while this
    // app is on React 18. Pre-bundle it through Vite's optimizer so the
    // react/react-dom aliases above pin it to this app's React 18 copy —
    // otherwise its JSX runs against React 19 and react-dom 18 rejects the
    // elements ("Objects are not valid as a React child").
    deps: { optimizer: { web: { enabled: true, include: ['lucide-react', '@use-gesture/react'] } } },
  },
});
