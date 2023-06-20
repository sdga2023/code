<script>
  import mapbox from 'mapbox-gl';
  import { onDestroy } from 'svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Legend from '../general/Legend.svelte';
  import { scaleSequential } from 'd3';
  import { OrangeRamp, YellowRamp } from '$lib/styles/colorscales';

  export let data;
  export let activeScene;
  export let parentHeight;
  export let parentWidth;
  export let rai;
  export let access_health;
  export let medical_center;
  export let local_health_center;

  let RAILegendScale = scaleSequential(OrangeRamp).domain([0, 100]).clamp(true);
  let healthAccessLegendScale = scaleSequential(YellowRamp).domain([0, 100]).clamp(true);

  mapbox.accessToken = 'pk.eyJ1IjoibWxhbWJyZWNodHMiLCJhIjoiY2s4NGh2anB5MHBlMzNrcXRhc3EyaDJ3MiJ9.5FaoRnh9UoKBpccXcyDs8A';

  let mapContainer;
  let map;

  function load() {
    map = new mapbox.Map({
      container: mapContainer,
      style: 'mapbox://styles/mlambrechts/cl4zbyhv1000114pekdef912m',
      bounds: [
        [-100, -45],
        [100, 50]
      ],
      interactive: false
    });

    map.on('load', () => {
      // From https://docs.mapbox.com/mapbox-gl-js/example/data-join/
      map.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });
      const matchExpression = ['match', ['get', 'iso_3166_1_alpha_3']];

      for (const row of data) {
        const color = RAILegendScale(row['rai']);
        matchExpression.push(row['iso3c'], color);
      }
      matchExpression.push('rgba(0, 0, 0, 0)');

      map.addLayer(
        {
          id: 'countries-rai-join',
          type: 'fill',
          source: 'countries',
          'source-layer': 'country_boundaries',
          paint: {
            'fill-color': matchExpression
          }
        },
        'burkina-access-health-facilities'
      );
    });
  }

  $: if (map && map.isStyleLoaded() && activeScene.id == 'rai-africa') {
    map.fitBounds([
      [-45, -45],
      [90, 45]
    ]);
    map.setPaintProperty('countries-rai-join', 'fill-opacity', 1);
    map.setPaintProperty('wb-countries-rai-ok-centroids', 'text-opacity', 1);
    map.setPaintProperty('country-label', 'text-opacity', 0);
    map.setPaintProperty('burkina-access-health-facilities', 'fill-opacity', 0);
    map.setPaintProperty('burkina-health-facilities', 'circle-opacity', 0);
    map.setPaintProperty('burkina-centroids', 'text-opacity', 0);
  }

  $: if (map && map.isStyleLoaded() && activeScene.id == 'rai-burkina') {
    map.fitBounds([
      [-6.52, 9.22],
      [3.5, 15]
    ]);
    map.setPaintProperty('country-label', 'text-opacity', 1);
    map.setPaintProperty('countries-rai-join', 'fill-opacity', 1);
    map.setPaintProperty('wb-countries-rai-ok-centroids', 'text-opacity', 1);
    map.setPaintProperty('burkina-access-health-facilities', 'fill-opacity', 0);
    map.setPaintProperty('burkina-health-facilities', 'circle-opacity', 0);
    map.setPaintProperty('burkina-health-facilities', 'circle-stroke-opacity', 0);
    map.setPaintProperty('burkina-centroids', 'text-opacity', 0);
  }

  $: if (map && map.isStyleLoaded() && activeScene.id == 'healthcenters') {
    map.fitBounds([
      [-6.52, 9.22],
      [3.5, 15]
    ]);
    map.setPaintProperty('countries-rai-join', 'fill-opacity', 0);
    map.setPaintProperty('wb-countries-rai-ok-centroids', 'text-opacity', 0);
    map.setPaintProperty('burkina-access-health-facilities', 'fill-opacity', 0);
    map.setPaintProperty('burkina-health-facilities', 'circle-opacity', 0.8);
    map.setPaintProperty('burkina-health-facilities', 'circle-stroke-opacity', 0);
    map.setPaintProperty('burkina-centroids', 'text-opacity', 0);
  }

  $: if (map && map.isStyleLoaded() && activeScene.id == 'healthtotal') {
    map.fitBounds([
      [-6.52, 9.22],
      [3.5, 15]
    ]);
    map.setPaintProperty('countries-rai-join', 'fill-opacity', 0);
    map.setPaintProperty('wb-countries-rai-ok-centroids', 'text-opacity', 0);
    map.setPaintProperty('burkina-access-health-facilities', 'fill-opacity', 1);
    map.setPaintProperty('burkina-health-facilities', 'circle-opacity', 0.5);
    map.setPaintProperty('burkina-health-facilities', 'circle-stroke-opacity', 0.5);
    map.setPaintProperty('burkina-centroids', 'text-opacity', 1);
  }

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

{#if parentHeight && parentWidth}
  <div bind:this={mapContainer} style:width={parentWidth + 'px'} style:height={parentHeight + 'px'} />

  <div class="legend-container">
    {#if activeScene.index < 2}
      <div class="legend">
        <Legend
          title={rai}
          color={RAILegendScale}
          unitLabel={''}
          tickLabels={[
            { value: 0, label: '0' },
            { value: 100, label: '100' }
          ]}
          digits="0"
        />
      </div>
    {/if}

    {#if activeScene.id == 'healthcenters'}
      <div class="legend">
        <CategoricalLegend
          legendType="custom"
          customItems={[
            { key: medical_center, colour: '#2b98c6' },
            { key: local_health_center, colour: '#35b1e5' }
          ]}
        />
      </div>
    {/if}

    {#if activeScene.id == 'healthtotal'}
      <div class="legend">
        <CategoricalLegend
          legendType="custom"
          customItems={[
            { key: medical_center, colour: '#2b98c6' },
            { key: local_health_center, colour: '#35b1e5' }
          ]}
        />
      </div>
      <div class="legend">
        <Legend
          title={access_health}
          color={healthAccessLegendScale}
          tickLabels={[
            { value: 0, label: '0' },
            { value: 100, label: '100' }
          ]}
          digits="0"
        />
      </div>
    {/if}
  </div>
{/if}

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/mapbox-gl/dist/mapbox-gl.css" on:load={load} />
</svelte:head>

<style>
  .legend-container {
    display: flex;
    justify-content: center;
    min-height: 45px;
    flex-wrap: wrap;
  }
</style>
