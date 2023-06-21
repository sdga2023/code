<script>
  import mapbox from 'mapbox-gl';
  import { onDestroy } from 'svelte';

  export let activeScene;
  export let parentHeight;
  export let parentWidth;

  mapbox.accessToken = 'pk.eyJ1IjoibWxhbWJyZWNodHMiLCJhIjoiY2s4NGh2anB5MHBlMzNrcXRhc3EyaDJ3MiJ9.5FaoRnh9UoKBpccXcyDs8A';

  let mapContainer;
  let map;

  let initialZoom;

  function load() {
    map = new mapbox.Map({
      container: mapContainer,
      style: 'mapbox://styles/mlambrechts/clbqg7fp0004y14pee8d51fec',
      bounds: [
        [-180, -90],
        [180, 90]
      ],
      interactive: false,
      maxBounds: [
        [-180, -90],
        [180, 90]
      ]
    });

    initialZoom = map.getZoom();
  }

  $: if (map && map.isStyleLoaded()) {
    map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0);
    map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 0);
    map.setPaintProperty('eez', 'fill-opacity', 0);
    map.setPaintProperty('wdpam', 'fill-opacity', 0);
    if (activeScene.id == 'intro') {
      map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0);
      map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 0);
      map.setPaintProperty('eez', 'fill-opacity', 0);
      map.setPaintProperty('wdpam', 'fill-opacity', 0);
    } else if (activeScene.id == 'mpas1' || activeScene.id == 'mpas2') {
      map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0);
      map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 0);
      map.setPaintProperty('eez', 'fill-opacity', 0);
      map.setPaintProperty('wdpam', 'fill-opacity', 1);
    } else if (activeScene.id == 'eez1' || activeScene.id == 'eez2') {
      map.flyTo({center: [0, 0], zoom: initialZoom})
      map.setPaintProperty('admin-0-boundary', 'line-opacity', 0)
      map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0);
      map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 0);
      map.setPaintProperty('eez', 'fill-opacity', 0.5);
      map.setPaintProperty('wdpam', 'fill-opacity', 1);
    } else if (activeScene.id == 'nazcasalas') {
      map.fitBounds(
        [
          [-118, -32],
          [-65, -18]
        ],
        {
          padding: { top: 40, bottom: 40, left: 40, right: 40 }
        }
      );
      map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0.8);
      map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 1);
      map.setPaintProperty('eez', 'fill-opacity', 0.5);
      map.setPaintProperty('wdpam', 'fill-opacity', 1);
    } else if (activeScene.id == 'mexico') {
      map.fitBounds(
        [
          [-124, 12],
          [-76, 33]
        ],
        {
          padding: { top: 40, bottom: 40, left: 40, right: 40 }
        }
      );
      map.setPaintProperty('admin-0-boundary', 'line-opacity', 1)
      map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0);
      map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 0);
      map.setPaintProperty('eez', 'fill-opacity', 0.5);
      map.setPaintProperty('wdpam', 'fill-opacity', 1);
    } else if (activeScene.id == 'kiribati') {
      map.fitBounds(
        [[-182.26457, -14.94775], [-147.73391, 8.37790]],
        {
          padding: { top: 40, bottom: 40, left: 40, right: 40 }
        }
      );
      map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0);
      map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 0);
      map.setPaintProperty('eez', 'fill-opacity', 0.5);
      map.setPaintProperty('wdpam', 'fill-opacity', 1);
    } else if (activeScene.id == 'australia') {
      map.fitBounds(
        [
          [109, -45],
          [160, -8]
        ],
        {
          padding: { top: 40, bottom: 40, left: 40, right: 40 }
        }
      );
      map.setPaintProperty('nazca-salas-gomez', 'fill-opacity', 0);
      map.setPaintProperty('nazca-salas-gomez-label', 'text-opacity', 0);
      map.setPaintProperty('eez', 'fill-opacity', 0.5);
      map.setPaintProperty('wdpam', 'fill-opacity', 1);
    }
  }

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

{#if parentHeight && parentWidth}
  <div bind:this={mapContainer} style:width={parentWidth + 'px'} style:height={parentHeight + 'px'} />
{/if}

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/mapbox-gl/dist/mapbox-gl.css" on:load={load} />
</svelte:head>
