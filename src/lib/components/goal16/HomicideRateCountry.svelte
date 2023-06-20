<script>
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';

  export let cx;
  export let cy;
  export let country;

  const cx2 = tweened(cx, {
    duration: 500,
    easing: cubicInOut
  });
  const cy2 = tweened(cy, {
    duration: 500,
    easing: cubicInOut
  });

  $: {
    cx2.set(cx);
    cy2.set(cy);
  }
</script>

<circle r={5} cx={$cx2} cy={$cy2} fill="var(--color-vis-region-{country.region_iso3c})" on:mouseover on:mouseout />
