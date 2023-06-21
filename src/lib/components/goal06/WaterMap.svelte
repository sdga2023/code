<script>
  import { _ } from 'svelte-i18n';
  import * as Tokens from '$lib/styles/vis.js';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { isMobile } from '$lib/stores/isMobile';

  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, scaleSequential, color, piecewise, interpolateLab } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Legend from '$lib/components/general/Legend.svelte';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import Number from '../general/Number.svelte';

  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import sdg06CountriesJSON from '../../../data/other/sdg06_countries_topo.json';
  import nileRiverNetworkJSON from '../../../data/other/nile_river_network_topo.json';
  import riverBasinsJSON from '../../../data/other/basin_level_topo.json';
  import nileJSON from '../../../data/other/nile.json';

  export let data;
  export let legend;
  export let activeScene;
  export let water_stress;

  export let parentWidth;
  export let parentHeight;

  let width = parentWidth;
  let height = parentHeight - 50;

  const margins = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  $: w = width - margins.left - margins.right;
  $: h = height - margins.top - margins.bottom;

  $: worldScale = $isMobile ? w / 5 : Math.min(w / 7, h / 2.5);

  const ramp = piecewise(interpolateLab, [
    Colors.ColorBaseBlue300,
    Colors.ColorBaseGreen400,
    Colors.ColorBaseYellow500,
    Colors.ColorBaseOrange600
  ]);

  let colorScale = scaleSequential(ramp).domain([0, 100]).clamp(true);

  let disputed = null;
  let centroids = null;
  let countries2 = null;
  let nileRiverNetwork = null;
  let basins = null;
  let nile = null;

  (async () => {
    disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;
    centroids = centroidsJSON.features;
    nileRiverNetwork = topojson.feature(nileRiverNetworkJSON, nileRiverNetworkJSON.objects['nile-river-network-simplified']).features;
    nile = topojson.feature(nileJSON, nileJSON.objects.nile).features;

    basins = topojson.feature(riverBasinsJSON, riverBasinsJSON.objects['basin-level-simplified']).features.map((c) => {
      const iso3 = c.properties.iso3c;
      const centroid = geoPath().projection(projection).centroid(c);

      let fill = Colors.ColorVisNotAvailable;

      const datum = c.properties;
      fill = colorScale(datum.water_stress);

      const stroke = color(fill).darker(1);

      return { ...c, fill, stroke, centroid, data: datum };
    });

    countries2 = topojson.feature(sdg06CountriesJSON, sdg06CountriesJSON.objects['country-level']).features.map((c) => {
      const iso3 = c.properties.iso3c;
      const centroid = centroids.find((c) => c.properties.iso_3c === iso3)?.geometry.coordinates;

      let fill = Colors.ColorVisNotAvailable;

      const datum = c.properties;
      datum.water_stress = data.find((d) => d.iso === iso3)?.water_stress;

      fill = colorScale(datum.total);

      const stroke = color(fill).darker(1);

      return { ...c, fill, stroke, centroid, data: datum };
    });
  })();

  const globeOffset = 0;

  const rotation = tweened([0, 0], { easing: cubicInOut, duration: 800 });
  $: $rotation = [0, 0];

  const scale = tweened(worldScale, { easing: cubicInOut, duration: 800 });

  $: projection = geoEqualEarth()
    .fitExtent(
      [
        [globeOffset, globeOffset],
        [w - globeOffset, h - globeOffset]
      ],
      { type: 'Sphere' }
    )
    .center([$rotation[0], $rotation[1]])
    .scale($scale);

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  let currentCountry;

  $: refCountry = countries2.find((d) => d.data.iso3c === $referenceCountry);

  let selectedCountries = [];
  $: selectedCountriesISO = selectedCountries.map((d) => d.data.iso3c);

  let selectedBasins = [];
  $: selectedBasinNames = selectedBasins.map((d) => d.properties.MAJ_NAME);

  $: {
    if (activeScene.index === 0) {
      selectedCountries = [];
      selectedBasins = [];
      $rotation = [0, 0];
      $scale = worldScale;
    } else if (activeScene.index === 1) {
      selectedCountries = countries2.filter((c) => c.data.iso3c === 'PAK');
      selectedBasins = [];
      $rotation = selectedCountries[0].centroid;
      $scale = 800;
    } else if (activeScene.index === 2) {
      selectedCountries = countries2.filter((c) => c.data.iso3c === 'SGP');
      selectedBasins = [];
      $rotation = selectedCountries[0].centroid;
      $scale = 800;
    } else if (activeScene.index === 3) {
      selectedCountries = [];
      selectedBasins = [];
      $rotation = [0, 0];
      $scale = worldScale;
    } else if (activeScene.index === 4) {
      selectedCountries = [];
      selectedBasins = [];
      $rotation = countries2.filter((c) => c.data.iso3c === 'BOL')[0].centroid;
      $scale = 500;
    } else if (activeScene.index === 5) {
      selectedCountries = [];
      selectedBasins = [];
      $rotation = countries2.filter((c) => c.data.iso3c === 'BOL')[0].centroid;
      $scale = 500;
    } else if (activeScene.index === 6) {
      selectedCountries = countries2.filter((c) => c.data.iso3c === 'CHL');
      selectedBasins = [];
      $rotation = selectedCountries[0].centroid;
      $scale = 800;
    } else if (activeScene.index === 7) {
      selectedCountries = [];
      selectedBasins = [];
      $rotation = [0, 0];
      $scale = worldScale;
    } else if (activeScene.index >= 8) {
      selectedCountries = [];
      selectedBasins = basins.filter((d) => d.properties.MAJ_NAME === 'Nile');
      $rotation = selectedBasins[0].centroid;
      $scale = 950;
    }
  }
</script>

<div class="svg-container" bind:clientWidth={parentWidth} bind:clientHeight={parentHeight}>
  <div class="map">
    <svg {width} {height} on:mousemove={updateMouse}>
      <g transform="translate({margins.left}, {margins.top})">
        {#if countries2 && projection}
          {#if activeScene.index >= 5}
            <g class="basins">
              {#each basins as basin}
                <path
                  d={geoPath().projection(projection)(basin)}
                  style:fill={basin.fill}
                  class="basin"
                  vector-effect="non-scaling-stroke"
                  style:stroke={selectedBasinNames.includes(basin.properties.MAJ_NAME) ? 'black' : basin.fill}
                  style:stroke-width={selectedBasinNames.includes(basin.properties.MAJ_NAME) ? 7 : 0.3}
                />
              {/each}
            </g>
          {/if}
          <g class="countries">
            {#each countries2 as country}
              <path
                d={geoPath().projection(projection)(country)}
                fill={activeScene.index < 5 ? country.fill : 'transparent'}
                on:mouseover={() => (currentCountry = country.properties.iso3c)}
                on:mouseout={() => (currentCountry = null)}
              />
              {#if selectedCountriesISO.includes(country.data.iso3c)}
                <path d={geoPath().projection(projection)(country)} class="emphasisbg" />
                <path d={geoPath().projection(projection)(country)} class="emphasis" />
                <text
                  x={projection(country.centroid)[0]}
                  y={projection(country.centroid)[1] + Tokens.RefCountryOffset}
                  class="reference-label middle"
                  style:fill="var(--color-theme-text)"
                >
                  {$_(`country.${country.data.iso3c.toLowerCase()}`)}
                </text>
                <text
                  x={projection(country.centroid)[0]}
                  y={projection(country.centroid)[1] + Tokens.RefOffset}
                  class="reference-label middle"
                  style:fill="var(--color-theme-text)"
                >
                  <Number value={country.data.water_stress} unit="%" />
                </text>
              {/if}
            {/each}
          </g>

          {#if activeScene.index >= 8}
            <g class="nile">
              {#each nileRiverNetwork as river}
                <path
                  d={geoPath().projection(projection)(river)}
                  style:fill="none"
                  style:stroke="var(--color-base-blue300)"
                  style:stroke-width={0.5}
                  class="river"
                />
              {/each}
              {#each nile as n}
                <path
                  d={geoPath().projection(projection)(n)}
                  style:fill="none"
                  style:stroke="var(--color-base-blue400)"
                  style:stroke-width={3}
                  class="river"
                />
              {/each}
            </g>

            <!-- draw outlines for selected Basins-->
            <path
              d={geoPath().projection(projection)(basins.find((d) => selectedBasinNames.includes(d.properties.MAJ_NAME)))}
              vector-effect="non-scaling-stroke"
              class="emphasisbg"
            />
            <path
              d={geoPath().projection(projection)(basins.find((d) => selectedBasinNames.includes(d.properties.MAJ_NAME)))}
              vector-effect="non-scaling-stroke"
              class="emphasis"
            />
          {/if}

          {#if refCountry}
            <path
              d={geoPath().projection(projection)(refCountry)}
              class="emphasisbg"
              on:mouseover={() => (currentCountry = refCountry.properties.ISO_A3)}
              on:mouseout={() => (currentCountry = null)}
            />
            <path
              d={geoPath().projection(projection)(refCountry)}
              class="reference"
              on:mouseover={() => (currentCountry = refCountry.properties.ISO_A3)}
              on:mouseout={() => (currentCountry = null)}
            />
            <text
              x={projection(refCountry.centroid)[0]}
              y={projection(refCountry.centroid)[1] + Tokens.RefOffset}
              class="reference-label middle"
            >
              {$_(`country.${$referenceCountry.toLowerCase()}`)}
            </text>
          {/if}
        {/if}
        {#if disputed}
          {#each disputed as disp}
            <path d={geoPath().projection(projection)(disp)} class="not-available" style:stroke="#FFFFFF" style:stroke-width={0.5} />
          {/each}
        {/if}

        <g class="lenses">
          {#each selectedCountries as country}
            {@const c = projection(country.centroid)}

            {#if activeScene.index === 2}
              <circle cx={c[0]} cy={c[1]} r={10} class="emphasisbg" />
              <circle cx={c[0]} cy={c[1]} r={10} class="emphasis" />
            {/if}
          {/each}
        </g>
      </g>
    </svg>
  </div>
</div>
<div class="legend-div">
  <Legend
    title={water_stress}
    color={colorScale}
    units={'%'}
    tickLabels={[
      { label: '0%', value: 0 },
      { label: '25%', value: 25 },
      { label: '50%', value: 50 },
      { label: '75%', value: 75 },
      { label: '>100%', value: 100 }
    ]}
  />
</div>

{#if currentCountry && mousePos}
  <Tooltip visible={true} targetPos={mousePos}>
    <p class="geo">{$_(`country.${currentCountry?.toLowerCase()}`)}</p>
    <hr />
    <p class="label number">
      {#if countries2.find((c) => c.properties.iso3c === currentCountry)?.properties.water_stress < 0.1}
        <Number
          value={countries2.find((c) => c.properties.iso3c === currentCountry)?.properties.water_stress}
          fallback={'-'}
          digits={2}
          unit="%"
        />
      {:else if countries2.find((c) => c.properties.iso3c === currentCountry)?.properties.water_stress < 1}
        <Number
          value={countries2.find((c) => c.properties.iso3c === currentCountry)?.properties.water_stress}
          fallback={'-'}
          digits={1}
          unit="%"
        />
      {:else}
        <Number
          value={countries2.find((c) => c.properties.iso3c === currentCountry)?.properties.water_stress}
          fallback={'-'}
          unit="%"
          digits={0}
        />
      {/if}
      <span class="label small">{countries2.find((c) => c.properties.iso3c === currentCountry)?.properties.water_stress_cat}</span>
    </p>
    <p class="label small weaker">{water_stress}</p>
  </Tooltip>
{/if}

<style>
  .river {
    pointer-events: none;
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
  .legend-div {
    margin: var(--space-xs) 0;
  }
</style>
