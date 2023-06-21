<script>
  import { cubicInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let country;
  export let x;
  export let y;

  const position = tweened(x, { easing: cubicInOut });

  $: {
    $position = x;
  }
</script>

<text x={$position} y={country.y} style="font-size: var(--font-size-s); anchor: middle; dominant-baseline: central;">{country.iso3}</text>
