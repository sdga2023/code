<script>
  import { tweened } from 'svelte/motion';
  import { interpolate } from '$lib/external/flubber/flubber.min.js';
  import * as eases from 'svelte/easing';

  export let iso;
  export let d;
  export let state = 0;
  export let fill;
  export let currentYear;
  export let mouseover;
  export let mouseout;
  export let reference;
  export let emphasis;

  let lastYear = 2020;
  let lastState = 0;
  let lastChange = 'state';

  $: {
    d;
    iso;
    if (lastState !== state) {
      lastChange = 'state';
    } else if (lastYear !== currentYear) {
      lastChange = 'year';
    } else {
      lastChange = '';
    }
    lastYear = currentYear;
    lastState = state;
  }

  let interpolator = tweened(d[state][currentYear], {
    interpolate,
    easing: eases.cubicInOut,
    duration: 1000
  });

  $: $interpolator = d[state][currentYear];
</script>

{#if reference || emphasis}
  <path
    class={`${lastChange} state${state} emphasisbg`}
    d={lastChange === 'state' ? $interpolator : d[state][currentYear]}
    on:mouseover={mouseover}
    on:mouseout={mouseout}
    on:focus={mouseover}
    on:blur={mouseout}
  />
{/if}
<path
  class={`${lastChange} state${state} country`}
  class:reference
  class:emphasis
  d={lastChange === 'state' ? $interpolator : d[state][currentYear]}
  on:mouseover={mouseover}
  on:mouseout={mouseout}
  on:focus={mouseover}
  on:blur={mouseout}
  fill={fill[state]}
/>

<style>
  path.state {
    transition: fill 1s;
  }
</style>
