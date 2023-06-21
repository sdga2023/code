<script>
  import { scaleLog } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { getIncomeLevel } from './../../../data/countryRegionIncomeDictionary.js';
  import Tooltip from './../general/Tooltip.svelte';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { fade } from 'svelte/transition';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { isMobile } from '$lib/stores/isMobile';
  import { ScatterCircleRadius, ScatterCircleRadiusMob } from '$lib/styles/vis';

  export let data;
  export let xaxistitle;
  export let xaxisunits;
  export let yaxistitle;
  export let yaxisunits;

  let margins = {
    top: 20,
    right: 80,
    bottom: 50,
    left: 50
  };

  let w;
  let h = 600;

  $: radius = $isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius;

  $: scatterData = data ? data : [];

  $: xScale = scaleLog()
    .range([0, w - margins.left - margins.right])
    .domain([10, 10000]);
  const xTicks = [10, 100, 1000, 10000];

  const yScale = scaleLog()
    .range([h - margins.bottom - margins.top, 0])
    .domain([1000, 120000]);
  const yTicks = [1000, 10000, 100000];

  const colorScale = {
    LIC: Colors.ColorVisIncomeLow,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    HIC: Colors.ColorVisIncomeHigh
  };

  let currentCountry;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
</script>

<div bind:clientWidth={w} class="scatterplot">
  {#if w}
    <CategoricalLegend top={true} legendType="income" />
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <g transform={'translate(0,' + margins.top + ')'}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScale}
          ticks={yTicks}
          yAxisTitle={yaxistitle}
          yAxisUnits={yaxisunits}
        />
      </g>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisTitle={xaxistitle}
          xAxisUnits={xaxisunits}
        />
        {#each scatterData as country}
          <circle
            cx={xScale(country.transport_road)}
            cy={yScale(country.gdppcap)}
            r={radius}
            fill={colorScale[getIncomeLevel(country.iso3c)]}
            on:mouseover={() => (currentCountry = country)}
            on:mouseout={() => (currentCountry = null)}
            on:focus={() => (currentCountry = country)}
            on:blur={() => (currentCountry = null)}
          />
        {/each}
        {#if $referenceCountry && data.find((d) => d.iso3c == $referenceCountry)}
          <circle
            cx={xScale(data.find((d) => d.iso3c == $referenceCountry).transport_road)}
            cy={yScale(data.find((d) => d.iso3c == $referenceCountry).gdppcap)}
            r={radius + 2}
            class="reference"
            transition:fade|local={{ duration: 100 }}
          />
        {/if}
        {#if $referenceCountry && data.find((d) => d.iso3c == $referenceCountry)}
          <text
            class="label reference-label"
            x={xScale(data.find((d) => d.iso3c == $referenceCountry).transport_road) + 12}
            y={yScale(data.find((d) => d.iso3c == $referenceCountry).gdppcap) + 6}>{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
          >
        {/if}
        {#if currentCountry}
          <circle
            cx={xScale(currentCountry.transport_road)}
            cy={yScale(currentCountry.gdppcap)}
            r={radius + 2}
            class="emphasis"
            fill={'none'}
            transition:fade|local={{ duration: 100 }}
          />
        {/if}
      </g>
    </svg>
    {#if currentCountry && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p class="label caps">{$_(`country.${currentCountry.iso3c.toLowerCase()}`)}</p>
        <p class="label stronger">$<Number value={currentCountry.gdppcap} digits={0} /></p>
        <p class="label small weaker">{yaxisunits}</p>
        <hr />
        <p class="label stronger"><Number value={currentCountry.transport_road} digits={0} /></p>
        <p class="label small weaker">{xaxisunits}</p>
      </Tooltip>
    {/if}
  {/if}
</div>
