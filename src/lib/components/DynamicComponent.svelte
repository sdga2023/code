<script>
  import { onMount } from 'svelte';
  import Loading from './Loading.svelte';

  export let thiz;
  export let onScreen = true;
  export let path;
  export let data;

  let Component = Array.isArray(thiz) ? Loading : thiz;

  onMount(async () => {
    if (Array.isArray(thiz)) {
      Component = (await import(`./${thiz[0]}/${thiz[1]}.svelte`)).default;
    }
  });
</script>

{#if onScreen && (!path || data?.length)}
  <svelte:component this={Component} {...$$props} />
{:else}
  <svelte:component this={Loading} />
{/if}
