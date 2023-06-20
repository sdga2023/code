<script>
  import { _ } from 'svelte-i18n';
  import vars from '$lib/variables.js';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, json, interpolateRgbBasis, scaleSequential, extent, color } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Legend from '$lib/components/general/Legend.svelte';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import Number from '../general/Number.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';

  export let data;
  export let legend;

  let w;
  $: h = w / 1.7;

  let colorScale;

  $: if (data) {
    const [min, max] = extent(data.filter((c) => c.year === '2020-2021').map((c) => c['excess.mean']));

    const dmax = max;
    const dmin = Math.abs(min);
    const d = Math.max(dmax, dmin) / 2;

    const ramp = interpolateRgbBasis([Colors.ColorBaseBlue700, Colors.ColorBaseDarkPurple100, Colors.ColorBasePink600]);

    colorScale = scaleSequential(ramp).domain([-d * 2, d * 2]);
  }

  let countries = null;
  let disputed = null;
  let land = null;
  let centroids = null;
  let regions = null;

  (async () => {
    disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;
    regions = topojson.feature(regionsJSON, regionsJSON.objects.wb_regions).features;
    land = topojson.feature(landJSON, landJSON.objects.wb_land).features;
    centroids = centroidsJSON.features;

    countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features.map((c) => {
      const iso3 = c.properties.ISO_A3;
      const countryData = data.find((c) => c.iso3 === iso3 && c.year === '2020-2021');

      const centroid = centroids.find((c) => c.properties.iso_3c === iso3)?.geometry.coordinates;

      let fill = Colors.ColorVisNotAvailable;
      if (countryData) {
        const datum = countryData['excess.mean'];
        fill = colorScale(datum);
      }
      const stroke = color(fill).darker(1);
      return { ...c, fill, stroke, centroid, data: countryData };
    });
  })();

  const globeOffset = 0;

  $: projection = geoEqualEarth().fitExtent(
    [
      [globeOffset, globeOffset],
      [w - globeOffset, h - globeOffset]
    ],
    { type: 'Sphere' }
  );

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  let currentCountry;
  let refCountry;

  $: if (countries && $referenceCountry) {
    refCountry = countries.find((c) => c.properties.ISO_A3 === $referenceCountry);
    const projected = projection(refCountry.centroid);
    refCountry.projected = { x: projected[0], y: projected[1] };
  } else {
    refCountry = null;
  }
</script>

<div class="excess-map-wrapper">
  <div class="excess-map" bind:clientWidth={w} bind:clientHeight={h}>
    <svg width={w} height={h} on:mousemove={updateMouse}>
      {#if countries && projection}
        {#each countries as country}
          <path
            d={geoPath().projection(projection)(country)}
            fill={country.fill}
            stroke={country.stroke}
            stroke-width={0.5}
            on:mouseover={() => (currentCountry = country.properties.ISO_A3)}
            on:mouseout={() => (currentCountry = null)}
            on:focus={() => (currentCountry = country.properties.ISO_A3)}
            on:blur={() => (currentCountry = null)}
          />
          {#if false && country.centroid}
            <text x={projection(country.centroid)?.[0]} y={projection(country.centroid)?.[1]}>{country.properties.ISO_A3}</text>
          {/if}
        {/each}
        {#if refCountry}
          <path
            d={geoPath().projection(projection)(refCountry)}
            fill="transparent"
            stroke="var(--color-reference-country)"
            stroke-width={2}
            on:mouseover={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:mouseout={() => (currentCountry = null)}
            on:focus={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:blur={() => (currentCountry = null)}
          />
          <text class="reference-label" x={refCountry.projected.x} y={refCountry.projected.y}
            >{$_(`country.${refCountry.properties.ISO_A3.toLowerCase()}`)}</text
          >
          <text class="reference-label" x={refCountry.projected.x} y={refCountry.projected.y + 20}>{refCountry?.data['excess.mean']}</text>
        {/if}
      {/if}
      {#if disputed}
        {#each disputed as disp}
          <path d={geoPath().projection(projection)(disp)} fill="var(--color-vis-not-available)" stroke="#FFFFFF" stroke-width={0.5} />
        {/each}
      {/if}
    </svg>
  </div>

  <Legend title={legend} color={colorScale} />
  {#if currentCountry && mousePos}
    <Tooltip visible={true} targetPos={mousePos}
      >{$_(`country.${currentCountry?.toLowerCase()}`)}
      <Number value={data.find((c) => c.iso3 === currentCountry && c.year === '2020-2021')?.['excess.mean']} />
    </Tooltip>
  {/if}
</div>

<style type="text/scss">
  path {
    outline: none;
  }
  .excess-map-wrapper {
    grid-column: full;

    position: relative;

    height: 80vh;
  }
  .excess-map {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    width: 100%;
    height: 100%;
  }

  .reference-label {
    text-anchor: middle;

    fill: white;
    text-shadow: -2px -2px var(--color-reference-country), -2px 2px var(--color-reference-country), 2px 2px var(--color-reference-country),
      2px -2px var(--color-reference-country), -2px 0 var(--color-reference-country), 0 2px var(--color-reference-country),
      2px 0 var(--color-reference-country), 0 -2px var(--color-reference-country);
  }
</style>
