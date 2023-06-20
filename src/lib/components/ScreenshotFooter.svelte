<script>
  import { _ } from 'svelte-i18n';

  import { base } from '$app/paths';

  export let note;
  export let source;

  export let theme;
</script>

<div class={`screenshot-footer-container ${theme}`}>
  <div class="logo-container">
    <img class="wb-logo" title="logo" alt="logo" src="{base}/assets/external/loop-header-footer/img/logo-wb.svg" />
    {#if theme === 'dark'}
      <img class="atlas-logo" title="logo" alt="logo" src="{base}/assets/external/loop-header-footer/img/logo-atlas-dark.svg" />
    {:else}
      <img class="atlas-logo" title="logo" alt="logo" src="{base}/assets/external/loop-header-footer/img/logo-atlas.svg" />
    {/if}
  </div>

  <p class="source">
    {#if note}
      <span class="pref">{$_('note', { default: 'Note:' })}</span>
      {@html note}
      <br />
    {/if}
    {#if source}
      <span class="pref">{$_('source', { default: 'Source:' })}</span> {@html source}
    {/if}
  </p>
</div>

<style>
  .screenshot-footer-container {
    display: flex;

    border-top: 1px solid var(--color-grey-200);
    padding-top: var(--space-xs);
    margin-top: var(--space-m);
    margin-bottom: var(--space-xs);

    gap: var(--space-m);
  }
  .pref {
    font-weight: var(--font-weights-semibold);
  }

  .logo-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    gap: var(--space-s);
  }

  .logo-container img {
    height: 36px;
  }
  .logo-container img.atlas-logo {
    height: 32px;
  }

  .source {
    flex: 1;

    color: var(--color-theme-text-weaker);
    font-family: var(--font-families-open-sans);
    letter-spacing: var(--letter-spacing-0);
    font-size: var(--font-size-s);
    font-weight: var(--font-weights-regular);
    margin-top: 0;
    padding: 0;

    text-align: right;
  }

  .screenshot-footer-container.dark .source {
    color: var(--color-theme-dark-text-weaker);
  }
</style>
