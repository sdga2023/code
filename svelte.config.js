import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const prod = process.env.NODE_ENV === 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),
  compilerOptions: {
    hydratable: true,
    dev: !prod
  },
  kit: {
    adapter: adapter({
      strict: false,
      fallback: '404.html'
    }),

    paths: {
      base: prod ? '/sdgatlas' : '',
      relative: false
    }
  }
};

export default config;
