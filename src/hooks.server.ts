// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { locale, register, waitLocale } from 'svelte-i18n';
export const categories = ['general', 'countries', 'regions', 'income', 'targets'];

export const handle: Handle = async ({ event, resolve }) => {
  // TODO: 'en' for now, make adjustable later:
  const lang = 'en';
  if (lang) {
    locale.set(lang);

    // load dynamically, based on locale:
    // (only default locale for now, TODO: enable dynamic load once language switching is available)
    categories.forEach(async (category) => {
      register(lang, async () => import(`./static/i18n/global/global.${category}.${lang}.i18n.json`));
    });

    await waitLocale();
  }
  return resolve(event);
};
