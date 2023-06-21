<script>
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';
  import { interpolate } from '$lib/external/flubber/flubber.min.js';
  import { fade } from 'svelte/transition';

  export let countryOrCircle;
  export let countryPath;
  export let countryCircle;
  export let fill;
  export let showTooltip;
  export let hideTooltip;
  export let hoveredCountry;
  export let countryData;
  export let activeScene;
  export let incomegroup;

  $: interpolator = tweened(countryPath, {
    interpolate,
    easing: eases.cubicInOut,
    duration: 1500
  });

  $: if (countryOrCircle == 'circle') $interpolator = countryCircle;
  $: if (countryOrCircle == 'country') $interpolator = countryPath;

  function handleMouseOver(e) {
    hoveredCountry = countryData;
    showTooltip(e);
  }
  function handleMouseOut(e) {
    hideTooltip();
    hoveredCountry = undefined;
  }
</script>

{#if activeScene?.index > 5 && activeScene?.index < 8 && incomegroup == 'HIC'}
  <path d={$interpolator} class={'emphasis'} style:stroke-width={4} transition:fade|local />
{/if}
{#if activeScene?.index > 3 && activeScene?.index < 6 && incomegroup == 'LIC'}
  <path d={$interpolator} class={'emphasis'} style:stroke-width={4} transition:fade|local />
{/if}

<path
  d={$interpolator}
  {fill}
  style:stroke-width={activeScene?.index > 2 ? 1 : 0.5}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  on:focus={handleMouseOver}
  on:blur={handleMouseOut}
  class={'country'}
/>
