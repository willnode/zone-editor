import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['monaco-editor', 'js-yaml']
  },
  build: {
    sourcemap: true
  }
});
