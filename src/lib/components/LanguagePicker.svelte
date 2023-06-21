<script>
  import { _, isLoading, locale, locales } from 'svelte-i18n';

  $: currentLocale = $locale;

  let selectEl;
  export let landingPage = false;

  $: {
    locale.set(currentLocale);
    if (selectEl) selectEl.value = currentLocale;
  }
</script>

<select class="language-picker" class:landing-page={landingPage} bind:value={currentLocale} this={selectEl}>
  <option id="label-option" value={currentLocale} hidden
    >{$isLoading || !landingPage ? currentLocale : $_(`base.locales.${currentLocale}`)}</option
  >
  {#each $locales as locale}
    <option value={locale}>{$isLoading ? '' : $_(`base.locales.${locale}`)}</option>
  {/each}
</select>

<style>
  .language-picker {
    width: 3em;
    text-transform: uppercase;
    font-size: var(--font-size-s);
    color: var(--color-theme-primary);
    background: none;
    font-weight: 600;
  }
  .language-picker.landing-page {
    width: 7em;
    color: var(--color-theme-dark-primary);
  }
</style>
