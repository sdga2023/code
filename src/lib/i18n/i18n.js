import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

export const locales = ['en', 'es', 'fr', 'ar', 'zh'];
export const defaultLocale = 'en';
export const categories = ['general', 'countries', 'regions', 'income', 'targets'];

const initI18N = () => {
  init({
    fallbackLocale: defaultLocale,
    initialLocale: defaultLocale,
    warnOnMissingMessages: false
  });

  // load dynamically, based on locale:
  categories.forEach((category) => {
    locales.forEach((locale) => register(locale, () => import(`../../static/i18n/global/global.${category}.${locale}.i18n.json`)));
  });
};

export default initI18N;
