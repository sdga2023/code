<script>
  export let text;

  export let width = '';

  // TODO: remove, test for responsive grid
  //export let width = Math.random() > 0.5 ? 'content' : Math.random() > 0.5 ? 'full' : '';
</script>

<div class="text-block {width} layout-main">{@html text}</div>

<style lang="scss">
  .text-block {
    line-height: var(--line-heights-175);
    font-weight: var(--font-weights-regular);
    font-family: var(--font-families-open-sans);
    /*font-size: var(--font-size-m);*/
    font-size: 17px;
    color: var(--color-theme-text);

    margin-top: var(--space-m);
    margin-bottom: var(--space-m);
  }

  :global(ul.bullet-list) {
    padding-left: 16px;
    list-style-type: disc;
  }
</style>
