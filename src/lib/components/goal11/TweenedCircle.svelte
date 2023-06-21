<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let x;
  export let y;
  export let data;
  export let activeScene;
  export let sizeScale;
  export let xScale;
  export let yScale;
  export let hoveredCountry;
  export let colour;

  $: highlightCountries = activeScene.index == 0
    ? ["CHN", "TUV"]
    : activeScene.index == 1 || activeScene.index == 2
      ? ["USA", "BMU", "VIR", "FRO", "MCO", "PRI"]
      : []

  const tweenedR = tweened(undefined, {
    duration: 1000,
    easing: cubicOut
  });
  $: if (activeScene.index < 1) {
    tweenedR.set(sizeScale(data.properties.waste));
  }
  $: if (activeScene.index > 0) {
    tweenedR.set(sizeScale(data.properties.wastepercap));
  }

  const tweenedX = tweened(x, {
    duration: 1000,
    easing: cubicOut
  });
  $: if (activeScene.index < 2) {
    tweenedX.set(x);
  }
  $: if (activeScene.index == 2) {
    tweenedX.set(xScale(data.properties.sharepopurban));
  }
  $: if (activeScene.index == 3) {
    tweenedX.set(xScale(data.properties.gdp));
  }

  const tweenedY = tweened(y, {
    duration: 1000,
    easing: cubicOut
  });
  $: if (activeScene.index < 2) {
    tweenedY.set(y);
  }
  $: if (activeScene.index > 1) {
    tweenedY.set(yScale(data.properties.wastepercap));
  }

  function handleMouseOver(e) {
    hoveredCountry = data;
  }
  function handleMouseOut(e) {
    hoveredCountry = undefined;
  }
</script>

{#if $tweenedR}
  <circle
    cx={$tweenedX}
    cy={$tweenedY}
    r={$tweenedR}
    class="circle"
    fill={colour}
    fill-opacity={0.75}
    stroke={colour}
    stroke-width={0.5}
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:focus={handleMouseOver}
    on:blur={handleMouseOut}
    transition:fade|local
  />
  {#if highlightCountries.includes(data.properties.iso3c)}
    <circle cx={$tweenedX} cy={$tweenedY} r={$tweenedR} class={'highlight emphasisbg'} />
    <circle cx={$tweenedX} cy={$tweenedY} r={$tweenedR} class={'highlithgt emphasis'} />
  {/if}
  {#if hoveredCountry && hoveredCountry.properties.iso3c == data.properties.iso3c}
    <circle cx={$tweenedX} cy={$tweenedY} r={$tweenedR} class={'emphasisbg'} />
    <circle cx={$tweenedX} cy={$tweenedY} r={$tweenedR} class={'emphasis'} />
  {/if}
  {#if $referenceCountry && $referenceCountry == data.properties.iso3c}
    <circle cx={$tweenedX} cy={$tweenedY} r={$tweenedR} class={'emphasisbg'} />
    <circle cx={$tweenedX} cy={$tweenedY} r={$tweenedR} class={'reference emphasis'} />
  {/if}
{/if}

<style>
  circle {
    transition: opacity 0.5s;
    pointer-events: all;
  }
  circle.highlight {
    pointer-events: none;
  }
</style>
