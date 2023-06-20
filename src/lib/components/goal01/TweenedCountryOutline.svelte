<script>
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';
  import { interpolate } from '$lib/external/flubber/flubber.min.js';

  export let countryOrCircle;
  export let countryPath;
  export let countryCircle;
  export let reference;
  export let trigger;

  $: interpolator = tweened(countryPath, {
    interpolate,
    easing: eases.cubicInOut,
    duration: reference && trigger == 'scroll' ? 1500 : 0
  });

  $: if (countryOrCircle == 'circle') $interpolator = countryCircle;
  $: if (countryOrCircle == 'country') $interpolator = countryPath;
</script>

<path d={$interpolator} fill={'none'} class={'emphasisbg'} />
<path d={$interpolator} class:reference class="emphasis" />
