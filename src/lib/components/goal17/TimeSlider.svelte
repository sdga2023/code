<script>
  import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa/src/fa.svelte';
  import { scaleLinear } from 'd3';
  import { isMobile } from '$lib/stores/isMobile';

  export let years;
  export let currentYear;
  export let timeSliderHeight;
  export let enabled;

  let timeSliderWidth;

  $: scale = scaleLinear()
    .domain(years)
    .range([30, timeSliderWidth - 45]);

  $: yearGap = $isMobile ? 10 : 5;
  $: yearLabels = allYears.filter((d) => d % yearGap === 0);

  let allYears = [];
  for (let year = years[0]; year <= years[1]; year++) {
    allYears.push(year);
  }

  let mousePos;
  let isDragging = false;

  function updateMouse(evt) {
    if (isDragging) {
      mousePos = { x: evt.layerX, y: evt.layerY };
      currentYear = Math.round(scale.invert(mousePos.x));

      if (currentYear < years[0]) currentYear = years[0];
      if (currentYear > years[1]) currentYear = years[1];
    }
  }
</script>

<div class="time-container" bind:clientHeight={timeSliderHeight}>
  {#each yearLabels as year}
    <p style:left={scale(year) + 'px'} class="label small year-label">{year}</p>
  {/each}
  <div class="time-slider" class:enabled class:active={isDragging} style:left={`${scale(currentYear)}px`}>
    <p class="label small">
      {#if enabled}<Fa icon={faChevronLeft} /> {currentYear} <Fa icon={faChevronRight} />{:else}{currentYear}{/if}
    </p>
    <p class="pointing-down">|</p>
  </div>
  <div
    class="time-bar"
    class:enabled
    bind:clientWidth={timeSliderWidth}
    on:mouseenter={updateMouse}
    on:mousemove={updateMouse}
    on:pointermove={updateMouse}
    on:mouseleave={() => (isDragging = false)}
    on:pointerleave={() => (isDragging = false)}
    on:pointercancel={() => (isDragging = false)}
    on:mousedown={() => (isDragging = true)}
    on:pointerdown={() => (isDragging = true)}
    on:mouseup={() => (isDragging = false)}
    on:pointerup={() => (isDragging = false)}
  />
</div>

<style>
  .time-container {
    width: 100%;
    height: 50px;
    background-color: transparent;
    margin-bottom: 0px;
    position: relative;

    margin-left: 30px;

    margin-bottom: var(--space-s);
  }
  .year-label {
    position: absolute;
    bottom: 0;
    user-select: none;
    font-weight: 100;
    font-size: 10px;
    transform: translate(-50%, 0);
  }
  .time-bar {
    width: calc(100% - 45px);

    height: 35px;
    margin-left: 0%;
    border-bottom: 1px solid black;
    pointer-events: none;
  }
  .time-bar.enabled {
    pointer-events: all;
  }

  .time-slider {
    padding: var(--space-xs);
    text-align: center;
    position: absolute;
    top: 0;
    user-select: none;
    pointer-events: none;

    transform: translate(-50%, 0);
    transition: left 0.5s ease-in-out;
  }
  .time-slider.enabled {
    pointer-events: all;
    cursor: pointer;

    transition: none;
  }

  .time-slider .label {
    transition: transform 0.1s;
    font-weight: bold;
  }
  .time-slider .label :global(.svelte-fa) {
    display: inline-block;
  }

  .time-slider.active .label {
    transform: scale(1.3);
    pointer-events: none;
  }

  .time-slider .pointing-down {
    height: 10px;
    font-size: 10px;
    line-height: 10px;
    font-weight: bold;
  }
  .time-slider.enabled .label {
    background-color: var(--color-theme-primary);
    color: white;
    padding: 0 var(--space-xs);
    border-radius: 10px;
  }
</style>
