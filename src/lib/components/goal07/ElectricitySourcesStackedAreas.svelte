<script>
  import { scaleLinear } from 'd3-scale';
  import { area, stack, curveNatural } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import CountryPicker from '../general/CountryPicker.svelte';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';

  export let data;
  export let coal;
  export let gas;
  export let oil;
  export let nuclear;
  export let otherrenewables;
  export let hydro;
  export let bioenergy;
  export let solar;
  export let wind;
  export let yaxistitle;
  export let yaxisunits;

  const sources = [
    { key: 'coal', label: coal, colour: Colors.ColorGrey700 },
    { key: 'oil', label: oil, colour: Colors.ColorBaseLightBeige500 },
    { key: 'gas', label: gas, colour: Colors.ColorBaseDarkPurple300 },
    { key: 'nuclear', label: nuclear, colour: Colors.ColorBasePurple200 },
    { key: 'bioenergy', label: bioenergy, colour: Colors.ColorBaseGreen300 },
    { key: 'hydro', label: hydro, colour: Colors.ColorBaseTeal300 },
    { key: 'wind', label: wind, colour: Colors.ColorBaseBlue300 },
    { key: 'solar', label: solar, colour: Colors.ColorBaseYellow200 },
    { key: 'otherrenewable', label: otherrenewables, colour: Colors.ColorBaseGreen100 }
  ];

  $: worldData = data.filter((d) => d.iso3c == 'WLD');
  $: stackedWorldData = stack().keys(sources.map((d) => d.key))(worldData);

  $: countryData = selectedCountry ? data.filter((d) => d.iso3c == selectedCountry) : null;
  $: stackedCountryData = countryData ? stack().keys(sources.map((d) => d.key))(countryData) : null;

  let margins = {
    top: 30,
    right: 20,
    bottom: 24,
    left: 36
  };

  let w;
  let h = 450;

  let yMax = 0;
  $: if (countryData) {
    yMax = 0;
    countryData.forEach((yearData) => {
      let yearSum = 0;
      sources
        .map((d) => d.key)
        .forEach((source) => {
          yearSum = yearSum + yearData[source];
        });
      yMax = yearSum > yMax ? yearSum : yMax;
    });
  }

  $: yLimitCountry = Math.ceil(yMax / Math.pow(10, Math.floor(Math.log10(yMax)))) * Math.pow(10, Math.floor(Math.log10(yMax)));

  $: xScale = scaleLinear()
    .domain([2000, 2020])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2000, 2010, 2020];

  const yScaleWorld = scaleLinear()
    .domain([0, 30000000])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicksWorld = [0, 30000000];
  $: yScaleCountry = scaleLinear()
    .domain([0, yLimitCountry])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicksCountry = [0, yLimitCountry];

  $: areaGeneratorWorld = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScaleWorld(d[0]))
    .y1((d) => yScaleWorld(d[1]))
    .curve(curveNatural);

  $: areaGeneratorCountry = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScaleCountry(d[0]))
    .y1((d) => yScaleCountry(d[1]))
    .curve(curveNatural);

  let selectedCountry;
  let countriesToRemove = countriesISO.filter((d) => ![...new Set(data.map((c) => c.iso3c))].includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);
</script>

<div class="stacked-area" bind:clientWidth={w}>
  <CountryPicker bind:selectedCountry {remove} clear={() => (selectedCountry = null)} />
  {#if !stackedCountryData}
    <p class="title caps centered">{$_(`region.${'WLD'}`)}</p>
    <svg width={w} height={h}>
      <g transform={'translate(0,' + margins.top + ')'}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScaleWorld}
          ticks={yTicksWorld}
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
        />
        {#if stackedWorldData}
          {#each stackedWorldData as serie, i}
            <path d={areaGeneratorWorld(serie)} fill={sources[i].colour} />
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
  {#if stackedCountryData}
    <p class="title caps centered">{$_(`country.${selectedCountry.toLowerCase()}`)}</p>
    <svg width={w} height={h}>
      <g transform={'translate(0,' + margins.top + ')'}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScaleCountry}
          ticks={yTicksCountry}
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
        />
        {#if stackedCountryData}
          {#each stackedCountryData as serie, i}
            <path d={areaGeneratorCountry(serie)} fill={sources[i].colour} />
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
  <CategoricalLegend
    legendType="custom"
    customItems={sources.slice(4, 9).map((d) => {
      return { key: d.label, colour: d.colour };
    })}
  />
  <CategoricalLegend
    legendType="custom"
    customItems={sources.slice(0, 4).map((d) => {
      return { key: d.label, colour: d.colour };
    })}
  />
</div>

<style>
  .stacked-area {
    width: 100%;
  }
</style>
