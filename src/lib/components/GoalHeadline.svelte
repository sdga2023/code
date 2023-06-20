<script>
  export let text;
</script>

<h1>
  {#if text}
    {@html text}
  {/if}
</h1>

<style>
  h1 {
    grid-column: main;

    font-size: var(--font-size-xxl);
    font-family: var(--font-families-andes);
    font-weight: var(--font-weights-regular);
    color: var(--color-theme-text);
    line-height: var(--line-heights-120);

    margin-bottom: var(--space-xl);
  }
</style>
