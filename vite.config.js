import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  build: {
    sourcemap: false,
    minify: 'esbuild'
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ['fuzzy']
  },
  server: {
    fs: {
      allow: ['src', 'static']
    }
  }
};

export default config;
