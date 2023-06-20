<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import * as Tokens from '$lib/styles/vis.js';
  import { isMobile } from '$lib/stores/isMobile';
  import { scaleLinear } from 'd3-scale';

  export let activeScene;
  export let x;
  export let yStart;
  export let yEnd;
  export let fill;
  export let opacity;
  export let country;
  export let currentCountry;
  export let year;
  export let currentYear;

  $: radius = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;
  $: circleRadiusScale = scaleLinear().domain([1991, 2019]).range([1, radius]);

  const tweenedY = tweened(undefined, {
    duration: 500,
    easing: cubicOut
  });
  $: if (activeScene.index < 3) {
    tweenedY.set(yStart);
  }

  $: if (activeScene.index > 2) {
    tweenedY.set(yEnd);
  }

  function handleMouseOver(e) {
    currentCountry = country;
    if (year) {
      currentYear = year;
    }
  }
  function handleMouseOut(e) {
    currentCountry = undefined;
    currentYear = undefined;
  }
</script>

{#if $tweenedY}
  <circle
    cx={x}
    cy={$tweenedY}
    r={year ? circleRadiusScale(year) : radius}
    class="circle"
    {fill}
    {opacity}
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:focus={handleMouseOver}
    on:blur={handleMouseOut}
    transition:fade|local
  />
{/if}

<style>
  circle {
    transition: opacity 0.5s;
    pointer-events: all;
  }
</style>
