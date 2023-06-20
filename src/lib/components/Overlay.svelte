<script>
  import vars from '$lib/variables';
  import OverlayGraphic from './OverlayGraphic.svelte';

  import { browser } from '$app/environment';

  export let charts;
  export let imagePath;
  export let activeChartIndex = -1;

  $: activeChart = activeChartIndex > -1 ? charts[activeChartIndex] : null;

  function slideLeft(e) {
    e.preventDefault();

    activeChartIndex--;
    while (activeChartIndex < 0) {
      activeChartIndex += charts.length;
    }
  }

  function slideRight(e) {
    e.preventDefault();

    activeChartIndex++;
    activeChartIndex = activeChartIndex % charts.length;
  }

  function close() {
    activeChartIndex = -1;
  }

  $: isActive = activeChartIndex > -1;

  // disable scrolling on body once active:
  $: if (browser) {
    if (isActive) {
      document.body.style['overflow-x'] = 'hidden';
      document.body.style['overflow-y'] = 'hidden';
    } else {
      document.body.style['overflow-x'] = 'hidden';
      document.body.style['overflow-y'] = 'inherit';
    }
  }

  function handleKeydown(event) {
    if (isActive) {
      const { key } = event;
      if (key === 'ArrowLeft') {
        slideLeft(event);
      }
      if (key === 'ArrowRight') {
        slideRight(event);
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="overlay-container" class:active={isActive}>
  <div class="overlay-background" on:click={close} on:keypress={close} />
  <div class="cards-and-buttons">
    <div class="icon-container">
      <div class="icon" style={`background-image: url(${vars.pathPrefix}/assets/icons/arrow-left.svg)`} on:click={slideLeft} />
    </div>

    {#if activeChart}
      <div class="overlay-graphic-container">
        <OverlayGraphic {imagePath} chart={activeChart} {close} />
      </div>
    {/if}

    <div class="icon-container">
      <div class="icon" style={`background-image: url(${vars.pathPrefix}/assets/icons/arrow-right.svg)`} on:click={slideRight} />
    </div>
  </div>
</div>

<style>
  .overlay-container {
    position: fixed;
    inset: 0;

    display: none;
    z-index: 99999;

    opacity: 0;
    transition: 1.25s all;
  }

  .overlay-container.active {
    display: block;
    opacity: 1;
  }

  .overlay-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(116, 113, 139, 0.7);
  }

  .cards-and-buttons {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;

    position: absolute;
    top: 0;
    left: 0;

    pointer-events: none;
  }

  .icon {
    width: 30px;
    height: 30px;
    background-color: var(--color-theme-bg-weakest);
    border-radius: 15px;

    flex: 0 0 30px;

    background-repeat: no-repeat;
    background-position: center center;

    box-shadow: 0 0px 0px rgba(0, 0, 0, 0.25);
    transition: 0.25s all;

    pointer-events: all;

    margin: var(--space-m);
  }

  .cards-and-buttons .icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;

    background-repeat: no-repeat;
    background-position: center;
  }
  .cards-and-buttons .icon:hover {
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
    transform: scale(1.1);
  }

  .overlay-graphic-container {
    height: 95vh;
    margin-top: 2.5vh;
    margin-bottom: 2.5vh;

    overflow-x: hidden;
    overflow-y: auto;

    pointer-events: all;

    display: flex;
    flex-direction: column;
  }
</style>
