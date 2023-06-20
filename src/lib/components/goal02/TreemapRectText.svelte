<script>
  import { onMount } from 'svelte';

  export let text;
  export let rectWidth;

  let el;

  $: showText = el?.getBBox().width < rectWidth - 20 ? true : false;
</script>

<text opacity={0} class="label small" bind:this={el}>{text}</text>
{#if showText}
  <text dy={15} dx={5} class="label small category">
    {text}
  </text>
{/if}
