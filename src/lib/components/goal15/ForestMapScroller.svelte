<script>
  import { Canvas, LayerCake, Svg } from 'layercake';
  import { _ } from 'svelte-i18n';
  import { geoPath, geoEqualEarth, schemePuRd, schemeYlGn, schemeSpectral, scaleLinear } from 'd3';
  import { geoVoronoi } from 'd3-geo-voronoi';
  import * as topojson from 'topojson-client';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import Legend from '$lib/components/general/Legend.svelte';
  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import CanvasMap from './CanvasMap.svelte';
  import Lens from '../general/Lens.svelte';
  import { scaleSequential } from 'd3';
  import { interpolateLab, piecewise } from 'd3';
  import { fade } from 'svelte/transition';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { GreenRamp, PinkRamp } from '$lib/styles/colorscales.js';
  import { isMobile } from '$lib/stores/isMobile';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { RefOffset } from '$lib/styles/vis';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let activeScene;
  export let sequestration;
  export let emission;
  export let net;
  export let units;
  export let amazon;
  export let congo;
  export let seasia;
  export let seasia_net;
  export let congo_net;
  export let amazon_net;

  const gridToShowMap = {
    remov: 'remov',
    emis: 'emis',
    net: 'net',
    seasia: 'net',
    amazoncongo: 'net'
  };

  const divergingPalette = [
    Colors.ColorBaseBlue500,
    Colors.ColorBaseBlue400,
    Colors.ColorBaseBlue300,
    Colors.ColorBaseBlue200,
    Colors.ColorBaseLightBeige100,
    Colors.ColorBaseRed200,
    Colors.ColorBaseRed300,
    Colors.ColorBaseRed400,
    Colors.ColorBaseRed500
  ];

  //let removRamp = piecewise(interpolateLab, schemeYlGn[9]);
  let removRamp = GreenRamp;
  $: colorScaleRemov = scaleSequential(removRamp).domain([0, 10000000]);

  //let emisRamp = piecewise(interpolateLab, schemePuRd[9]);
  let emisRamp = PinkRamp;
  $: colorScaleEmis = scaleSequential(emisRamp).domain([0, 10000000]);

  let netRamp = piecewise(interpolateLab, divergingPalette);
  $: colorScaleNet = scaleSequential(netRamp).domain([-10000000, 10000000]);

  let features = [];
  $: data.forEach((d) => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [d.x, d.y]
      },
      properties: {
        emissions: d.emissions,
        removals: d.emissions,
        net: d.emissions,
        coloremis: colorScaleEmis(d.emissions),
        colorremov: colorScaleRemov(d.removals),
        colornet: colorScaleNet(d.net)
      }
    });
  });

  $: geoJson = { type: 'FeatureCollection', features };
  $: polygons = geoVoronoi(geoJson)
    .polygons()
    .features.filter((d) => d.properties.site.properties.emissions != 0);

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries);
  let land = topojson.feature(landJSON, landJSON.objects.wb_land);
  let centroids = centroidsJSON.features;

  let d;

  $: globeOffset = 0;
  let w = parentWidth;
  $: h = w / 1.7;

  $: projection = geoEqualEarth().fitExtent(
    [
      [globeOffset, globeOffset],
      [w - globeOffset, h - globeOffset]
    ],
    { type: 'Sphere' }
  );

  let currentCountry;
  let refCountry;

  $: if (countries && $referenceCountry) {
    refCountry = countries.features.find((c) => c.properties.ISO_A3 === $referenceCountry);
    if(refCountry){
    refCountry.centroid = centroids.find((c) => c.properties.iso_3c === $referenceCountry).geometry.coordinates;
    const projected = projection(refCountry.centroid);
    refCountry.projected = { x: projected[0], y: projected[1] };
    }
  } else {
    refCountry = null;
  }

  $: path = geoPath().projection(projection);
  $: d = path(land);
  $: countryDs = countries?.features.map((c, i) => path(c));

  $: {
    d = path(land);
    countryDs = countries?.features.map((c, i) => path(c));
  }
</script>

<div class="map-container map" bind:clientHeight={h}>
  <LayerCake data={polygons}>
    <Canvas>
      <CanvasMap {projection} fill="#fff" gridToShow={gridToShowMap[activeScene.id]} />
    </Canvas>

    <Svg>
      <g style={`transform: translate(0, ${0}px)`}>
        <path {d} class="land" />
        {#each countries?.features as c, i}
          <path
            class="country"
            d={countryDs[i]}
            on:mouseover={() => (currentCountry = c.properties.ISO_A3)}
            on:focus={() => (currentCountry = c.properties.ISO_A3)}
            on:mouseout={() => (currentCountry = null)}
            on:blur={() => (currentCountry = null)}
          />
        {/each}

        {#if currentCountry}
          <path class="emphasisbg" d={path(countries.features.find((d) => d.properties.ISO_A3 === currentCountry))} />
          <path class="emphasis" d={path(countries.features.find((d) => d.properties.ISO_A3 === currentCountry))} />
        {/if}

        {#if refCountry}
          <path class="emphasisbg" d={path(countries.features.find((d) => d.properties.ISO_A3 === $referenceCountry))} />
          <path class="reference" d={path(countries.features.find((d) => d.properties.ISO_A3 === $referenceCountry))} />
          />
          <text class="reference-label" x={refCountry.projected.x} y={refCountry.projected.y + RefOffset} text-anchor="middle"
            >{$_(`country.${refCountry.properties.ISO_A3.toLowerCase()}`)}</text
          >
        {/if}

        {#if activeScene.index > 2}
          <g opacity={activeScene.index > 3 ? 0.6 : 1}>
            <Lens x={projection([105, 7])[0]} y={projection([105, 7])[1]} r={$isMobile ? 20 : 50} />
            <text
              class="caps"
              x={projection([105, 7])[0]}
              y={$isMobile ? projection([105, 7])[1] - 75 : projection([105, 7])[1] - 90}
              text-anchor={'middle'}
              transition:fade|local>{seasia}</text
            >
            <foreignObject
              x={projection([105, 7])[0] - 110}
              y={$isMobile ? projection([105, 7])[1] - 69 : projection([105, 7])[1] - 84}
              width={220}
              height={60}
              transition:fade|local><p class="label small" style="text-align:center">{seasia_net}</p></foreignObject
            >
          </g>
        {/if}
        {#if activeScene.index > 3}
          <Lens x={projection([23, -2])[0]} y={projection([23, -2])[1]} r={$isMobile ? 20 : 50} />
          <text
            class="caps"
            x={projection([23, -2])[0]}
            y={$isMobile ? projection([23, -2])[1] - 21 : projection([23, -2])[1] - 56}
            text-anchor={'middle'}
            transition:fade|local>{congo}</text
          >
          <foreignObject
            x={projection([23, -2])[0] - 110}
            y={$isMobile ? projection([23, -2])[1] + 25 : projection([23, -2])[1] + 64}
            width={220}
            height={60}
            transition:fade|local><p class="label small" style="text-align:center">{congo_net}</p></foreignObject
          >
          <Lens x={projection([-63, -6])[0]} y={projection([-63, -6])[1]} r={$isMobile ? 20 : 50} />
          <text
            class="caps"
            x={projection([-63, -6])[0]}
            y={$isMobile ? projection([-63, -6])[1] - 41 : projection([-63, -6])[1] - 56}
            text-anchor={'middle'}
            transition:fade|local>{amazon}</text
          >
          <foreignObject
            x={projection([-63, -6])[0] - 110}
            y={$isMobile ? projection([-63, -6])[1] + 49 : projection([-63, -6])[1] + 64}
            width={220}
            height={60}
            transition:fade|local><p class="label small" style="text-align:center">{amazon_net}</p></foreignObject
          >
        {/if}
      </g>
    </Svg>
  </LayerCake>
</div>
{#if activeScene.id == 'remov'}
  <Legend
    title={sequestration}
    color={colorScaleRemov}
    unitLabel={units}
    digits="0"
    tickLabels={[
      { value: 0, label: 0 },
      { value: 5000000, label: 5 },
      { value: 10000000, label: 10 }
    ]}
  />
{/if}
{#if activeScene.id == 'emis'}
  <Legend
    title={emission}
    color={colorScaleEmis}
    unitLabel={units}
    digits="0"
    tickLabels={[
      { value: 0, label: 0 },
      { value: 5000000, label: 5 },
      { value: 10000000, label: 10 }
    ]}
  />
{/if}
{#if activeScene.id != 'remov' && activeScene.id != 'emis'}
  <Legend
    title={net}
    color={colorScaleNet}
    unitLabel={units}
    digits="0"
    tickLabels={[
      { value: -10000000, label: -10 },
      { value: 0, label: 0 },
      { value: 10000000, label: 10 }
    ]}
  />
{/if}

<style>
  .map-container {
    flex: 1;
  }

  .map path {
    fill: transparent;
  }

  .map path.country {
    fill: transparent;
    pointer-events: all;
  }

  .map path.emphasis {
    stroke-width: 0.5px;
  }

  .country:hover {
    stroke-width: 0.5px;
    fill: #ffffff55;
    stroke: var(--color-theme-text);
  }
</style>
