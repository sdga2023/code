<script>
  import { tweened } from 'svelte/motion';
  import Number from '../general/Number.svelte';

  export let hover;
  export let country;
  export let w;
  export let i;

  const margin = 50;

  const values = tweened(
    {
      y0: country.y0,
      y1: country.y1,
      percentUkraine: country.percentUkraine
    },
    { duration: 0, delay: i * 1 }
  );

  $: {
    $values = {
      y0: country.y0,
      y1: country.y1,
      percentUkraine: country.percentUkraine
    };
  }
</script>

<g on:mouseover={() => (hover = country)} on:mouseout={() => (hover = undefined)}>
  <rect
    width={w}
    height={$values.y1 - $values.y0}
    y={$values.y0}
    fill="var(--color-theme-bg-weakest)"
    stroke="var(--color-theme-bg-weaker)"
  />
  <rect width={$values.percentUkraine * w} height={$values.y1 - $values.y0} y={$values.y0} fill="var(--color-base-yellow300)" />
</g>
{#if $values.y1 - $values.y0 > 10}
  <text
    class="label small caps stronger no-stroke"
    x={0}
    y={$values.y0 + ($values.y1 - $values.y0) / 2}
    dx={4}
    style="dominant-baseline: middle;">{country.key}</text
  >
{/if}
