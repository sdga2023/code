<script>
  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, scaleLinear, scaleSqrt, scaleLog, max, extent } from 'd3';
  import { isMobile } from '$lib/stores/isMobile';
  import { fade } from 'svelte/transition';
  import { getIncomeLevel } from '../../../data/countryRegionIncomeDictionary';
  import TweenedCircle from './TweenedCircle.svelte';
  import ChartGrid from '../ChartGrid.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import TweenedReferenceLabel from './TweenedReferenceLabel.svelte';

  export let data;
  export let urbanisationunits;
  export let urbanisationtitle;
  export let gdpunits;
  export let gdptitle;
  export let yaxistitle;
  export let yaxisunits;
  export let totalwasteunits;
  export let percapitawasteunits;
  export let populationtitle;
  export let activeScene;
  export let parentWidth;
  export let parentHeight;

  const colorScale = {
    HIC: Colors.ColorVisIncomeHigh,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    LIC: Colors.ColorVisIncomeLow
  };

  const margins = {
    top: 36,
    right: 56,
    bottom: 34,
    left: 30
  };

  $: wideLayout = parentWidth / parentHeight > 1.7;
  $: w = wideLayout ? parentHeight * 1.7 : parentWidth;
  $: h = wideLayout ? parentHeight : parentWidth / 1.7;

  $: maxRadius = activeScene.index < 1 ? ($isMobile ? 25 : 50) : $isMobile ? 10 : 20;

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features;
  let disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;
  let land = topojson.feature(landJSON, landJSON.objects.wb_land).features;
  let centroids = centroidsJSON.features;

  centroids.forEach((d) => {
    if (data.find((c) => c.iso3c == d.properties.iso_3c)) {
      d.properties = data.find((c) => c.iso3c == d.properties.iso_3c);
    }
  });
  $: centroidsWithData = centroids.filter((d) => d.properties.waste);

  let refCountryData;
  $: if (centroidsWithData && $referenceCountry && centroidsWithData.find((d) => d.properties.iso3c == $referenceCountry)) {
    refCountryData = centroidsWithData.find((d) => d.properties.iso3c == $referenceCountry);
  }

  $: projection = geoEqualEarth().fitExtent(
    [
      [$isMobile ? -40 : 0, 0],
      [w - margins.right, h]
    ],
    { type: 'Sphere' }
  );

  $: sizeScale = scaleSqrt()
    .domain([0, max(data, (d) => (activeScene.index < 1 ? d.waste : d.wastepercap))])
    .range([0, maxRadius]);
  $: xScale =
    activeScene.index < 3
      ? scaleLinear()
          .domain([0, max(data, (d) => d.sharepopurban)])
          .range([0, w - margins.left - margins.right])
      : scaleLog()
          .domain([800, max(data, (d) => d.gdp)])
          .range([0, w - margins.left - margins.right]);
  $: xTicks = activeScene.index < 3 ? [0, 25, 50, 75, 100] : [1000, 10000, 100000];
  $: yScale = scaleLinear()
    .domain([0, max(data, (d) => d.wastepercap)])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 500, 1000, 1400];

  let hoveredCountry;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
</script>

<CategoricalLegend legendType={'income'} top="true" />
<div class="svg-container map scatterplot" bind:clientHeight={h} bind:clientWidth={w}>
  <svg width={w} height={h} on:mousemove={updateMouse}>
    {#if activeScene?.index > 1}
      <g transform={`translate(0,${margins.top})`} transition:fade|local>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScale}
          ticks={yTicks}
          yAxisUnits={yaxisunits}
          yAxisTitle={yaxistitle}
        />
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisUnits={activeScene.index < 2 ? '' : activeScene.index == 2 ? urbanisationunits : gdpunits}
          xAxisTitle={activeScene.index < 2 ? '' : activeScene.index == 2 ? urbanisationtitle : gdptitle}
        />
      </g>
    {/if}
    <g transform={`translate(${margins.left},${margins.top})`}>
      {#if disputed && activeScene.index < 2}
        {#each disputed as disp}
          <path d={geoPath().projection(projection)(disp)} class="disputed" transition:fade|local />
        {/each}
      {/if}
      {#if countries && activeScene.index < 2}
        {#each countries as country}
          <path d={geoPath().projection(projection)(country)} class="country" transition:fade|local />
        {/each}
      {/if}
      {#if countries && activeScene.index < 2}
        {#each land as line}
          <path class="land" d={geoPath().projection(projection)(line)} transition:fade|local />
        {/each}
      {/if}
      {#each centroidsWithData as centroid}
        <TweenedCircle
          x={projection(centroid.geometry.coordinates)[0]}
          y={projection(centroid.geometry.coordinates)[1]}
          data={centroid}
          {activeScene}
          {sizeScale}
          {xScale}
          {yScale}
          colour={colorScale[getIncomeLevel(centroid.properties.iso3c)]}
          bind:hoveredCountry
        />
      {/each}

      {#if refCountryData}
        <TweenedReferenceLabel
          {activeScene}
          {refCountryData}
          {xScale}
          mapX={projection(refCountryData.geometry.coordinates)[0]}
          mapY={projection(refCountryData.geometry.coordinates)[1]}
          {yScale}
          unit={activeScene.index == 0 ? totalwasteunits : percapitawasteunits}
        />
      {/if}
    </g>
  </svg>
</div>
{#if hoveredCountry && mousePos}
  <Tooltip visible={true} targetPos={mousePos}>
    <p class="label geo">{$_(`country.${hoveredCountry.properties.iso3c.toLowerCase()}`)}</p>
    <p class="number">
      <Number value={activeScene.index < 2 ? hoveredCountry.properties.waste : hoveredCountry.properties.wastepercap} digits={0} />
      {activeScene.index < 2 ? totalwasteunits : percapitawasteunits}
    </p>
    <p class="label small weaker">{yaxistitle}</p>
    {#if activeScene?.index > 0}
      <hr />
      <p class="number">
        <Number
          value={activeScene.index == 1 || activeScene.index == 2
            ? hoveredCountry.properties.pop
            : activeScene.index == 3
            ? hoveredCountry.properties.sharepopurban
            : hoveredCountry.properties.gdp}
          digits={0}
        />
        {activeScene.index == 1 || activeScene.index == 2 ? '' : activeScene.index == 3 ? urbanisationunits : gdpunits}
      </p>
      <p class="label small weaker">
        {activeScene.index == 1 || activeScene.index == 2 ? populationtitle : activeScene.index == 3 ? urbanisationtitle : gdptitle}
      </p>
    {/if}
  </Tooltip>
{/if}

<style>
  path.country,
  path.disputed {
    fill: white;
    stroke-width: 0.5px;
    stroke: var(--color-grey-200);
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
  svg {
    margin: auto;
  }
</style>
