<script>
  import { scaleLinear, scalePoint, scaleOrdinal } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import { _ } from 'svelte-i18n';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let xaxistitle;
  export let xaxisunits;
  export let bottom20;
  export let secondquintile;
  export let thirdquintile;
  export let fourthquintile;
  export let top20;

  let margins = {
    top: 20,
    right: 16,
    bottom: 30,
    left: 84
  };

  let w;
  $: h = 250;

  $: countries = [...new Set(data.map((d) => d.iso3c))].reverse();

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [0, 25, 50, 75, 100];
  $: yScale = scalePoint()
    .domain(countries)
    .range([0, h - margins.top - margins.bottom]);

  let colours = ['#FCE9A4', '#BBCA95', '#85A485', '#59756B', '#2F4141'];

  let colourScale = scaleOrdinal().domain([1, 2, 3, 4, 5]).range(colours);

  let legendItems = [
    { key: bottom20, colour: colours[0] },
    { key: secondquintile, colour: colours[1] },
    { key: thirdquintile, colour: colours[2] },
    { key: fourthquintile, colour: colours[3] },
    { key: top20, colour: colours[4] }
  ];
</script>

<div bind:clientWidth={w}>
  {#if w}
    <CategoricalLegend legendType="custom" customItems={legendItems} />
    <svg width={w} height={h}>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisUnits={xaxisunits}
          xAxisTitle={xaxistitle}
        />
        {#each data as point}
          <circle
            cx={xScale(point.learning_activities)}
            cy={yScale(point.iso3c)}
            r={6}
            fill={colourScale(point.quintile)}
            stroke={'white'}
            stroke-width={1}
          />
        {/each}
        {#if countries}
          {#each countries as country}
            <text class={'axis-label end'} x={xScale(0) - 6} y={yScale(country) + 4}>{$_(`country.${country.toLowerCase()}`)}</text>
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>
