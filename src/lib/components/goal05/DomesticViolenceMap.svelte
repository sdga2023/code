<script>
  // your script goes here

  import * as topojson from 'topojson-client';
  import * as Colors from '$lib/styles/tokens.es6';
  import { scaleSequential } from 'd3-scale';
  import { geoEqualEarth, geoPath } from 'd3-geo';
  import { format } from 'd3-format';
  import Tooltip from '../general/Tooltip.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { _ } from 'svelte-i18n';
  import { RefCountryOffset, RefOffset } from '$lib/styles/vis';
  import capitalize from '$lib/components/tools/capitalize.js';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import Number from '../general/Number.svelte';
  import Legend from '../general/Legend.svelte';
  import { interpolateLab, piecewise } from 'd3';

  const countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features;
  const land = topojson.feature(landJSON, landJSON.objects.wb_land).features;

  export let data;
  export let parentWidth;
  export let legend_label;
  export let tooltip_label = 'of women have been victims of intimate partner violence';

  const dataDict = data.reduce((obj, d) => {
    obj[d.code] = d;
    return obj;
  }, {});

  const RedRamp = piecewise(interpolateLab, [
    Colors.ColorBaseYellow100,
    Colors.ColorBaseOrange300,
    Colors.ColorBaseRed500,
    Colors.ColorBaseRed700
  ]);

  const colorScale = scaleSequential(RedRamp).domain([0, 50]);

  let margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  let hover,
    mousePosition = { x: 0, y: 0 };
  $: hoverData = dataDict[hover?.properties.ISO_A3];

  const formatPercent = format('.0%');

  $: chartWidth = parentWidth - margins.left - margins.right;
  $: chartHeight = $isMobile ? chartWidth / 1.7 : 600;

  $: projection = geoEqualEarth().fitExtent(
    [
      [$isMobile ? -40 : 0, 0],
      [chartWidth, chartHeight]
    ],
    { type: 'Sphere' }
  );
  $: path = geoPath().projection(projection);

  $: refCountry = countries.find((c) => $referenceCountry === c.properties.ISO_A3);
  $: refCountryCentroid = centroidsJSON.features.find((c) => $referenceCountry === c.properties.iso_3c);
  $: refCountryVal = dataDict[$referenceCountry]?.median;
</script>

<div class="map cartogram-container">
  <svg
    width={chartWidth}
    height={chartHeight}
    on:mousemove={(e) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    }}
  >
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <g>
        {#each land as line}
          <path class="land" d={path(line)} fill="none" stroke={Colors.ColorGrey600} stroke-width={0.5} />
        {/each}
      </g>
      <g>
        {#each countries as c}
          <path
            class="country"
            d={path(c)}
            fill={dataDict[c.properties.ISO_A3] ? colorScale(dataDict[c.properties.ISO_A3].median * 100) : Colors.ColorVisNotAvailable}
            data-iso={c.properties.ISO_A3}
            on:mouseover={() => (hover = c)}
            on:mouseout={() => (hover = undefined)}
            on:focus={() => (hover = c)}
            on:blur={() => (hover = undefined)}
          />
        {/each}
        {#if hoverData}
          <path class="emphasisbg" d={path(hover)} />
          <path class="emphasis" d={path(hover)} />
        {/if}
        {#if $referenceCountry && refCountryCentroid}
          <path class="emphasisbg" d={path(refCountry)} />
          <path class="reference" d={path(refCountry)} />

          <text
            class="reference-label middle"
            x={projection(refCountryCentroid.geometry.coordinates)[0]}
            y={projection(refCountryCentroid.geometry.coordinates)[1] + RefCountryOffset}
            >{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
          >
          <text
            class="reference-label middle"
            x={projection(refCountryCentroid.geometry.coordinates)[0]}
            y={projection(refCountryCentroid.geometry.coordinates)[1] + RefOffset}
            ><Number value={refCountryVal * 100} unit="%" fallback="-" /></text
          >
        {/if}
      </g>
    </g>
  </svg>
  {#if hoverData}
    <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
      <div class="label">
        {capitalize($_('in', { default: 'in' }))} <span class="label stronger">{hoverData.country}</span>,
        <span class="label stronger">{formatPercent(hoverData.median)}</span>
        {tooltip_label}.
      </div>
    </Tooltip>
  {/if}
  <Legend title={legend_label} color={colorScale} digits="0" units="%" unitLabel="%" />
</div>
