<script>
  import { tweened } from 'svelte/motion';

  export let cx;
  export let cy;
  export let r;
  export let highlight;

  const radius = tweened(0);

  $: $radius = r;
</script>

{#if highlight}
  <circle on:mouseover on:mouseout {cx} {cy} r={$radius + 3} stroke-width={3} stroke="white" fill="none" />
  <circle on:mouseover on:mouseout {cx} {cy} r={$radius + 3} stroke-width={1.5} stroke="black" fill="none" />
{/if}

<circle
  on:mouseover
  on:mouseout
  {cx}
  {cy}
  r={$radius}
  stroke="var(--color-vis-red)"
  fill-opacity={0.7}
  fill={highlight ? 'var(--color-base-yellow200) ' : 'var(--color-vis-red)'}
/>
