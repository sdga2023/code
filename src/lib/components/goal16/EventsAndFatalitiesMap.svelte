<script>
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { isMobile } from '$lib/stores/isMobile';

  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, json, interpolateRgbBasis, scaleSequential, extent, color } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import Number from '../general/Number.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import EventAndFatalitiesMapCircle from './EventAndFatalitiesMapCircle.svelte';

  export let data;
  export let legend;
  export let activeScene;
  export let parentHeight;
  export let parentWidth;
  export let labels;

  $: selectedYear = 2018 + activeScene.index;

  $: wideLayout = parentWidth / parentHeight > 1.7;
  $: w = wideLayout ? parentHeight * 1.7 : parentWidth;
  $: h = wideLayout ? parentHeight : parentWidth / 1.7;

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

  const highlight = [['AFG'], ['YEM'], ['SYR'], ['MEX', 'NGA'], ['UKR']];

  (async () => {
    disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;
    land = topojson.feature(landJSON, landJSON.objects.wb_land).features;
    centroids = centroidsJSON.features;

    countries = topojson
      .feature(countriesJSON, countriesJSON.objects.wb_countries)
      .features.map((c) => {
        const iso3 = c.properties.ISO_A3;
        const countryData = data.filter((c) => c.iso3c === iso3);
        const centroid = centroids.find((c) => c.properties.iso_3c === iso3)?.geometry.coordinates;

        let fill = Colors.ColorVisNotAvailable;
        const stroke = color(fill).darker(1);

        return { ...c, fill, stroke, centroid, data: countryData };
      })
      .filter((d) => d.properties.ISO_A3 !== undefined && d.properties.ISO_A3 !== '-99');
  })();

  const globeOffset = 0;

  $: projection = geoEqualEarth().fitExtent(
    [
      [globeOffset, globeOffset],
      [w - globeOffset, h - globeOffset]
    ],
    { type: 'Sphere' }
  );

  let mousePos = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  let currentCountry;
  let refCountry;

  $: if (countries && $referenceCountry && countries.find((c) => c.properties.ISO_A3 === $referenceCountry)) {
    refCountry = countries.find((c) => c.properties.ISO_A3 === $referenceCountry);
    const projected = projection(refCountry.centroid);
    refCountry.projected = { x: projected[0], y: projected[1] };
  } else {
    refCountry = null;
  }
</script>

<p class="label title centered" style="font-size: var(--space-l)">{selectedYear}</p>
<div class="fatalities-map svg-container" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h} on:mousemove={updateMouse}>
    {#if countries && projection}
      {#each countries as country}
        <path
          d={geoPath().projection(projection)(country)}
          fill={country.fill}
          stroke={country.stroke}
          stroke-width={0.5}
          on:mouseover={() => (currentCountry = country)}
          on:mouseout={() => (currentCountry = null)}
          on:focus={() => (currentCountry = country)}
          on:blur={() => (currentCountry = null)}
        />
      {/each}
      {#if refCountry}
        <g style="pointer-events: none;">
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
          <text class="reference-label-country" x={refCountry.projected.x} y={refCountry.projected.y}
            >{$_(`country.${refCountry.properties.ISO_A3.toLowerCase()}`)}</text
          >
        </g>
      {/if}
    {/if}
    {#if disputed}
      {#each disputed as disp}
        <path d={geoPath().projection(projection)(disp)} fill="var(--color-vis-not-available)" stroke="#FFFFFF" stroke-width={0.5} />
      {/each}
    {/if}

    {#each countries as country (country.properties.ISO_A3)}
      {#if country.centroid && country.data && country.data.find((d) => d.year === selectedYear)}
        <EventAndFatalitiesMapCircle
          cx={projection(country.centroid)?.[0]}
          cy={projection(country.centroid)?.[1]}
          r={Math.sqrt(country.data.find((d) => d.year === selectedYear).fatalities) * ($isMobile ? 0.07 : 0.2)}
          highlight={highlight[activeScene.index].includes(country.properties.ISO_A3)}
          on:mouseover={() => (currentCountry = country)}
          on:mouseout={() => (currentCountry = null)}
        />
      {/if}
    {/each}
  </svg>
</div>
<Tooltip visible={currentCountry && currentCountry.data[activeScene.index]} targetPos={mousePos}>
  {#if currentCountry && currentCountry.data}
    <div class="label geo">{$_(`country.${currentCountry.data[activeScene.index]?.iso3c.toLowerCase()}`)}</div>
    <hr />
    <div class="label number ">
      <Number value={currentCountry.data[activeScene.index]?.fatalities} digits="0" />
      <span class="label small weaker">{$_(labels.fatalities)}</span>
    </div>
  {/if}
</Tooltip>

<style type="text/scss">
  path {
    outline: none;
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
