<script>
  import * as Colors from '$lib/styles/tokens.es6';
  import { fade } from 'svelte/transition';

  export let x;
  export let y;
  export let r = 20;
</script>

<g class="lens" style="transform: translate({x}px, {y}px)" transition:fade|local>
  <filter id="shadow" x="-100%" y="-100%" width="400%" height="400%">
    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color={Colors.ColorGrey400} flood-opacity="0.2" />
  </filter>
  <circle class="outer" {r} filter="url(#shadow)" />
  <circle class="inner" {r} />
</g>

<style type="text/scss">
  .lens {
    pointer-events: none;
    .inner {
      stroke-width: 4px;
      stroke: var(--color-theme-bg);
      fill: transparent;
    }
    .outer {
      stroke-width: 5px;
      stroke: var(--color-grey-200);
      fill: transparent;
    }
  }
</style>
