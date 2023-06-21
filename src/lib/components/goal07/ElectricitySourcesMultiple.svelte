<script>
  import { scaleLinear } from 'd3-scale';
  import { area, stack, curveNatural } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';

  export let data;
  export let country;
  export let height;
  export let yaxisunits;
  export let yaxistitle;
  export let displayAxisTitle;
  //export let yMax;

  const sources = [
    { key: 'coal', colour: Colors.ColorGrey600 },
    { key: 'oil', colour: Colors.ColorBaseLightBeige500 },
    { key: 'gas', colour: Colors.ColorBaseDarkPurple300 },
    { key: 'nuclear', colour: Colors.ColorBasePurple200 },
    { key: 'bioenergy', colour: Colors.ColorBaseGreen300 },
    { key: 'hydro', colour: Colors.ColorBaseTeal300 },
    { key: 'wind', colour: Colors.ColorBaseBlue200 },
    { key: 'solar', colour: Colors.ColorBaseYellow200 },
    { key: 'otherrenewable', colour: Colors.ColorBaseGreen100 }
  ];

  $: countryData = data.filter((d) => d.iso3c == country);
  $: stackedData = countryData ? stack().keys(sources.map((d) => d.key))(countryData) : [];

  let margins = {
    top: 30,
    right: 14,
    bottom: 20,
    left: 14
  };

  let w;
  let h = height;

  let yMax = 0;
  $: if (countryData) {
    countryData.forEach((yearData) => {
      yMax = 0;
      let yearSum = 0;
      sources
        .map((d) => d.key)
        .forEach((source) => {
          yearSum = yearSum + yearData[source];
        });
      yMax = yearSum > yMax ? yearSum : yMax;
    });
  }

  $: yLimit = Math.ceil(yMax / Math.pow(10, Math.floor(Math.log10(yMax)))) * Math.pow(10, Math.floor(Math.log10(yMax)));

  $: xScale = scaleLinear()
    .domain([2000, 2020])
    .range([0, w - margins.left - margins.right]);
  $: xTicks = [2000, 2010, 2020];
  $: yScale = scaleLinear()
    .domain([0, yLimit])
    //.domain([0, yMax])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [0, yLimit];
  //$: yTicks = [0, yMax];

  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);
</script>

<div class="stacked-area" bind:clientWidth={w}>
  <p class="title caps centered">{$_(`country.${country.toLowerCase()}`)}</p>
  {#if w}
    <svg width={w} height={h}>
      <g transform={'translate(0,' + margins.top + ')'}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScale}
          ticks={yTicks}
          yAxisTitle={displayAxisTitle ? yaxistitle : ''}
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
        {#if stackedData}
          {#each stackedData as serie, i}
            <path d={areaGenerator(serie)} fill={sources[i].colour} />
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>

<style>
  .stacked-area {
    width: 100%;
  }
  .title {
    margin: var(--space-m) 0 var(--space-s) 0;
  }
</style>
