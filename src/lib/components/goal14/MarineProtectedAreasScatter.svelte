<script>
  import { scaleLog, scaleLinear } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { getRegion } from './../../../data/countryRegionIncomeDictionary.js';
  import Tooltip from './../general/Tooltip.svelte';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { fade } from 'svelte/transition';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { CountryPicker } from '$lib/components';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { isMobile } from '$lib/stores/isMobile';
  import { ScatterCircleRadius, ScatterCircleRadiusMob } from '$lib/styles/vis';

  export let data;
  $: withoutSmallIslands = data.filter((d) => d.iso3c == 'ABNJ' || !getRegion(d.iso3c).includes('is missing'));

  export let xaxistitle;
  export let xaxisunits;
  export let yaxistitle;
  export let yaxisunits;
  export let abnj;

  let margins = {
    top: 30,
    right: 50,
    bottom: 50,
    left: 20
  };

  let w;
  let h = 500;

  $: radius = $isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius;

  $: xScale = scaleLog()
    .range([0, w - margins.left - margins.right])
    .domain([10, 100000000]);
  $: xTicks = w < 620 ? [100, 10000, 1000000, 100000000] : [10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];

  const yScale = scaleLinear()
    .range([h - margins.bottom - margins.top, 0])
    .domain([0, 100]);
  const yTicks = [10, 25, 50, 75, 100];

  const colorScale = {
    MEA: Colors.ColorVisRegionMEA,
    ECS: Colors.ColorVisRegionECS,
    EAS: Colors.ColorVisRegionEAS,
    SSF: Colors.ColorVisRegionSSF,
    LCN: Colors.ColorVisRegionLCN,
    SAS: Colors.ColorVisRegionSAS,
    NAC: Colors.ColorVisRegionNAC
  };

  let currentCountry;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  let selectedCountry;
  let countriesToRemove = countriesISO.filter((d) => !data.map((d) => d.iso3c).includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);
</script>

<div bind:clientWidth={w} class="scatterplot">
  {#if w}
    <CountryPicker bind:selectedCountry {remove} />
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
        <line
          x1={xScale(1) - margins.left}
          x2={xScale(100000000) + margins.right}
          y1={yScale(10)}
          y2={yScale(10)}
          stroke={'black'}
          stroke-width={1.5}
        />
        {#if currentCountry}
          <circle
            cx={xScale(currentCountry.totalmarinearea)}
            cy={yScale(currentCountry.PAmarinecover)}
            r={radius + 1}
            transition:fade|local={{ duration: 100 }}
            class="circleoutline emphasis"
          />
        {/if}
        {#each withoutSmallIslands as country}
          <circle
            cx={xScale(country.totalmarinearea)}
            cy={yScale(country.PAmarinecover)}
            r={radius}
            fill={colorScale[getRegion(country.iso3c)]}
            on:mouseover={() => (currentCountry = country)}
            on:mouseout={() => (currentCountry = null)}
            on:focus={() => (currentCountry = country)}
            on:blur={() => (currentCountry = null)}
          />
        {/each}
        {#each withoutSmallIslands as country}
          {#if country.iso3c == 'ABNJ'}
            <text class="geo small" x={xScale(country.totalmarinearea) - 6} y={yScale(country.PAmarinecover) + 5} text-anchor={'end'}
              >{abnj}</text
            >
          {/if}
        {/each}
        {#if $referenceCountry && data.find((d) => d.iso3c == $referenceCountry)}
          <circle
            cx={xScale(data.find((d) => d.iso3c == $referenceCountry).totalmarinearea)}
            cy={yScale(data.find((d) => d.iso3c == $referenceCountry).PAmarinecover)}
            r={radius + 1}
            class="reference"
            fill={'none'}
            transition:fade|local={{ duration: 100 }}
          />
        {/if}
        {#if $referenceCountry && data.find((d) => d.iso3c == $referenceCountry)}
          <text
            class="label reference-label"
            x={xScale(data.find((d) => d.iso3c == $referenceCountry).totalmarinearea) + 12}
            y={yScale(data.find((d) => d.iso3c == $referenceCountry).PAmarinecover) + 6}
            >{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
          >
        {/if}
        {#if selectedCountry}
          <circle
            cx={xScale(data.find((d) => d.iso3c == selectedCountry).totalmarinearea)}
            cy={yScale(data.find((d) => d.iso3c == selectedCountry).PAmarinecover)}
            r={radius}
            class="circleoutline emphasis"
            fill={'none'}
            transition:fade|local={{ duration: 100 }}
          />
          <text
            class="label geo"
            x={xScale(data.find((d) => d.iso3c == selectedCountry).totalmarinearea) + 12}
            y={yScale(data.find((d) => d.iso3c == selectedCountry).PAmarinecover) + 6}
            >{$_(`country.${selectedCountry.toLowerCase()}`)}</text
          >
        {/if}
      </g>
    </svg>
    <CategoricalLegend legendType="regions" />
    {#if currentCountry && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p class="label caps">{currentCountry.iso3c == 'ABNJ' ? abnj : $_(`country.${currentCountry.iso3c.toLowerCase()}`)}</p>
        <p class="label stronger"><Number value={currentCountry.totalmarinearea} digits={0} /> {xaxisunits}</p>
        <p class="label small weaker">{xaxistitle}</p>
        <hr />
        <p class="label stronger"><Number value={currentCountry.PAmarinecover} digits={0} unit={'%'} /></p>
        <p class="label small weaker">{yaxistitle}</p>
      </Tooltip>
    {/if}
  {/if}
</div>
