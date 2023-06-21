<script>
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { isMobile } from '$lib/stores/isMobile';

  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, json, interpolateRgbBasis, scaleSequential, extent, color } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import CategoricalLegend from '$lib/components/general/CategoricalLegend.svelte';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import Number from '../general/Number.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';

  export let data;
  export let legend;
  export let labels;
  export let parentWidth;

  $: w = parentWidth;
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
  $: landPath = geoPath().projection(projection)(land[0]);

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

        if (countryData[0]?.cat === 'conf') {
          fill = Colors.ColorBaseRed500;
        } else if (countryData[0]?.cat === 'fragile') {
          fill = Colors.ColorBaseYellow200;
        }

        const stroke = color(fill).darker(1);

        return { ...c, fill, stroke, centroid, data: countryData };
      })
      .filter((d) => d.properties.ISO_A3 !== undefined);
  })();

  const globeOffset = 0;

  $: projection = geoEqualEarth().fitExtent(
    [
      [globeOffset, globeOffset],
      [w - globeOffset, h - globeOffset]
    ],
    { type: 'Sphere' }
  );

  let mousePosition;
  function updateMouse(evt) {
    mousePosition = { x: evt.clientX, y: evt.clientY };
  }

  let hover;

  let currentCountry;
  let refCountry;

  $: if (countries && $referenceCountry) {
    refCountry = countries.find((c) => c.properties.ISO_A3 === $referenceCountry);
    if (refCountry.centroid) {
      const projected = projection(refCountry.centroid);
      refCountry.projected = { x: projected[0], y: projected[1] };
    }
  } else {
    refCountry = null;
  }
</script>

<CategoricalLegend
  title={legend}
  legendType="custom"
  customItems={[
    { key: $_(labels.conflict), colour: Colors.ColorBaseRed500 },
    { key: $_(labels.fcs), colour: Colors.ColorBaseYellow200 }
  ]}
/>
<svg width={w} height={h} on:mousemove={updateMouse} class="map">
  {#if countries && projection}
    {#each countries as country}
      <g on:mouseover={() => (hover = country)} on:mouseout={() => (hover = undefined)}>
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
      </g>
    {/each}

    {#each countries as country}
      <g on:mouseover={() => (hover = country)} on:mouseout={() => (hover = undefined)}>
        {#if country.centroid && country.data && country.data[0].cat !== null}
          {@const fill = country.data[0].cat === 'conf' ? Colors.ColorBaseRed800 : Colors.ColorBaseYellow500}
          <circle
            cx={projection(country.centroid)?.[0]}
            cy={projection(country.centroid)?.[1]}
            r={Math.sqrt(country.data[0].value * ($isMobile ? 0.0000003 : 0.000001))}
            {fill}
          />
        {/if}
      </g>
    {/each}
  {/if}
  {#if disputed}
    {#each disputed as disp}
      <path
        d={geoPath().projection(projection)(disp)}
        style:fill="var(--color-vis-not-available)"
        style:stroke="#FFFFFF"
        stroke-width={0.5}
      />
    {/each}
  {/if}
  <path d={landPath} fill={Colors.ColorVisNotAvailable} class="land" />
  {#if hover && hover.data[0].cat !== null}
    <path d={geoPath().projection(projection)(hover)} class="emphasisbg" />
    <path d={geoPath().projection(projection)(hover)} class="emphasis" />
  {/if}
  {#if refCountry && refCountry.data[0].cat !== null}
    <path d={geoPath().projection(projection)(refCountry)} class="emphasisbg" />
    <path d={geoPath().projection(projection)(refCountry)} class="reference" />
    <text
      class="reference-label-country central"
      x={refCountry.projected.x}
      y={refCountry.projected.y}
      dx={Math.sqrt(refCountry.data[0].value * ($isMobile ? 0.0000003 : 0.000001)) + 2}
      >{$_(`country.${refCountry.properties.ISO_A3.toLowerCase()}`)}
    </text>
  {/if}
  <g class="legend" transform="translate({w / 2}, {h - 40})">
    {#each [200, 100, 50] as n, i}
      <g transform="translate({i * 50 - i * i * 3}, 0)">
        <text class="label small middle" dy={15}>{n}M</text>
        {#if $isMobile}
          <circle
            cy={-Math.sqrt(n * 1000000 * 0.0000003)}
            r={Math.sqrt(n * 1000000 * 0.0000003)}
            fill="none"
            stroke="var(--color-grey-500)"
          />
        {:else}
          <circle
            cy={-Math.sqrt(n * 1000000 * 0.000001)}
            r={Math.sqrt(n * 1000000 * 0.000001)}
            fill="none"
            stroke="var(--color-grey-500)"
          />
        {/if}
      </g>
    {/each}
  </g>
</svg>

{#if hover && hover.data[0].cat !== null}
  <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
    <div class="label geo">{$_(`country.${hover.data[0].iso3c.toLowerCase()}`)}</div>
    <hr />
    <div class="label number">
      <Number value={hover.data[0].value} digits={0} />
    </div>
    <p class="label small weaker">
      {$_(labels.people_in_fcs)}
    </p>
  </Tooltip>
{/if}

<style type="text/scss">
  path {
    outline: none;
  }
</style>
