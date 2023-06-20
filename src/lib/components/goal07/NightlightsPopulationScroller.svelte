<script>
  import mapbox from 'mapbox-gl';
  import { onDestroy } from 'svelte';

  export let activeScene;
  export let parentHeight;
  export let parentWidth;
  export let lightsopacity;

  const eastMedBounds = [20.274958287085813, 29.006939848033067, 36.01120102997317, 40.18611894920547];
  const indiaBounds = [65.52580515540174, 5.802972096660732, 94.78261046592992, 33.63438982670608];
  const SSFBounds = [-18.12186683157018, -35.38113562838234, 51.77705030737599, 14.26646035124728];
  const ethiopiaBounds = [32.62733018662184, 3.1936199678341946, 48.16880018395002, 15.155181409447891];
  const nigeriaBounds = [2.5444188261489575, 4.167611674576581, 14.800992886692963, 14.0196329867344];
  const victoriaBounds = [27.93437176732945, -5.280660408278429, 37.46009709121104, 4.407707322217018];

  mapbox.accessToken = 'pk.eyJ1IjoibWxhbWJyZWNodHMiLCJhIjoiY2s4NGh2anB5MHBlMzNrcXRhc3EyaDJ3MiJ9.5FaoRnh9UoKBpccXcyDs8A';

  let mapContainer;
  let map;

  function load() {
    map = new mapbox.Map({
      container: mapContainer,
      style: 'mapbox://styles/mlambrechts/cl9n6tc2v004z14lgket2fira',
      center: [10, 10],
      zoom: 2,
      interactive: false
    });
  }

  $: if (map && activeScene.id == 'mediterranean-population') {
    map.fitBounds(eastMedBounds);
    map.setPaintProperty('nightlights', 'raster-opacity', 0);
  }
  $: if (map && (activeScene.id == 'mediterranean-lights' || activeScene.id == 'mediterranean-lights-2')) {
    map.fitBounds(eastMedBounds);
    map.setPaintProperty('nightlights', 'raster-opacity', 1);
  }

  $: if (map && (activeScene.id == 'india' || activeScene.id == 'india-2')) {
    map.fitBounds(indiaBounds);
  }

  $: if (map && (activeScene.id == 'africa' || activeScene.id == 'africa-2')) {
    map.fitBounds(SSFBounds);
  }

  $: if (map && activeScene.id == 'ethiopia') {
    map.fitBounds(ethiopiaBounds);
  }

  $: if (map && activeScene.id == 'nigeria') {
    map.fitBounds(nigeriaBounds);
  }
  $: if (map && activeScene.id == 'victoria') {
    map.fitBounds(victoriaBounds);
  }

  onDestroy(() => {
    if (map) map.remove();
  });

  let overlayOpacity = 1;
  $: if (map && map.isStyleLoaded() && activeScene.index > 1) {
    map.setPaintProperty('nightlights', 'raster-opacity', overlayOpacity);
  }
  $: if (map && activeScene.id == 'explore') {
    map.keyboard.enable();
    map.dragPan.enable();
    map.doubleClickZoom.enable();
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/mapbox-gl/dist/mapbox-gl.css" on:load={load} />
</svelte:head>

{#if parentHeight && parentWidth}
  <div bind:this={mapContainer} style:width={parentWidth + 'px'} style:height={parentHeight + 'px'} />
{/if}
{#if activeScene.index > 1}
  <div class="slider-container">
    <label for="overlay-opacity">{lightsopacity}</label>
    <input type="range" id="overlay-opacity" min={0} max={1} step={0.01} bind:value={overlayOpacity} />
  </div>
{/if}

<style>
  .slider-container {
    position: absolute;
    width: 200px;
    top: 20px;
    left: 20px;
    background-color: var(--color-theme-dark-bg);
    color: var(--color-theme-dark-text);
    font-size: var(--font-size-s);
    z-index: 10;
    padding: 8px;
    border-radius: 2px;
  }
  label {
    margin-bottom: 2px;
  }
  input[type='range'] {
    -webkit-appearance: none;
    margin: var(--space-xs) 0 0 0;
    background: none;
    width: 100%;
  }
  input[type='range']:focus {
    outline: none;
  }
  input[type='range']::-webkit-slider-runnable-track {
    width: 100%;
    height: 18px;
    cursor: pointer;
    box-shadow: none;
    background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, #ffe9a4 100%);
    border-radius: 12px;
    border: 1px solid var(--color-theme-dark-text-weaker);
  }
  input[type='range']::-moz-range-track {
    width: 100%;
    height: 18px;
    cursor: pointer;
    box-shadow: none;
    background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, #ffe9a4 100%);
    border-radius: 12px;
    border: 1px solid var(--color-theme-dark-text-weaker);
  }

  input[type='range']::-webkit-slider-thumb {
    box-shadow: none;
    border: 3px solid var(--color-theme-dark-text);
    height: 20px;
    width: 20px;
    border-radius: 12px;
    background: none;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -2px;
  }

  input[type='range']::-moz-range-thumb {
    box-shadow: none;
    border: 3px solid var(--color-theme-dark-text);
    height: 20px;
    width: 20px;
    border-radius: 12px;
    background: none;
    cursor: pointer;
    margin-top: -2px;
  }
  input[type='range']::-ms-track {
    width: 100%;
    height: 10px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  input[type='range']::-ms-fill-lower {
    background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, #ffe9a4 100%);
    border: 1px solid var(--color-theme-dark-text-weaker);
    border-radius: 12px;
    box-shadow: none;
  }
  input[type='range']::-ms-fill-upper {
    background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, #ffe9a4 100%);
    border: 1px solid var(--color-theme-dark-text-weaker);
    border-radius: 12px;
    box-shadow: none;
  }
  input[type='range']::-ms-thumb {
    box-shadow: none;
    border: 3px solid var(--color-theme-dark-text);
    height: 20px;
    width: 20px;
    border-radius: 12px;
    background: none;
    cursor: pointer;
  }
  input[type='range']:focus::-ms-fill-lower {
    background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, #ffe9a4 100%);
  }
  input[type='range']:focus::-ms-fill-upper {
    background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, #ffe9a4 100%);
  }
</style>
