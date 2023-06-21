<script>
  import variables from '$lib/variables.js';
  import { base } from '$app/paths';

  export let url;
  export let full = false;
  export let content = false;
  export let alt;
</script>

<img class={full ? 'layout-full' : content ? 'layout-content' : 'layout-main'} src={`${base}/assets/images/${url}`} {alt} />

<style lang="scss">
  img {
    line-height: var(--line-heights-175);
    font-weight: var(--font-weights-regular);
    font-family: var(--font-families-open-sans);
    font-size: var(--font-size-m);
    color: var(--color-theme-dark-bg);

    /*width: 100%;*/
  }
</style>
