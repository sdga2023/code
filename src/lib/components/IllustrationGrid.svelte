<script>
  import variables from '$lib/variables';

  export let illustrations;
  export let image_cols;
  export let gap = 'var(--grid-gutter)';
</script>

<div class="illuContainer" style="gap: {gap}">
  {#each illustrations as illu}
    <img src={variables.pathPrefix + '/' + illu.path} style="width: var(--col-{image_cols})" alt={illu.alt} />
  {/each}
</div>

<style>
  .illuContainer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: var(--space-xl) 0;
  }

  img {
    max-width: 100%;
  }
</style>
