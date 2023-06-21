<script>
  export let cols = 4;
</script>

<div class="cell" style="--cols:var(--col-{cols})">
  <slot />
</div>

<style>
  .cell {
    margin: 0;
    width: var(--cols);
  }

  @media screen and (max-width: 872px) {
    .cell {
      width: var(--col-6);
    }
  }
</style>
