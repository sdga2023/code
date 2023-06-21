// +layout.ts
import { browser } from '$app/environment';
import initI18N from '$lib/i18n/i18n.js';
import { waitLocale } from 'svelte-i18n';

export const load = async () => {
  if (browser) {
    initI18N();
  }
  await waitLocale();
};

export const prerender = true;
