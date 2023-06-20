<script>
  import { scaleLinear, scalePoint } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import { _ } from 'svelte-i18n';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import Number from '../general/Number.svelte';

  export let data;
  export let xaxistitle;
  export let xaxisunits;
  export let precovid;
  export let postcovid;

  let margins = {
    top: 30,
    right: 22,
    bottom: 36,
    left: 92
  };

  let w;
  $: h = 350;

  $: xScale = scaleLinear()
    .domain([0, 40])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [0, 20, 40];
  $: yScale = scalePoint()
    .domain(data.map((d) => d.iso3c))
    .range([0, h - margins.top - margins.bottom])
    .padding(0.3);
</script>

<div bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h} class="arrowplot">
      <defs>
        <marker id="arrowhead-red" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={Colors.ColorBaseRed600} stroke="white" stroke-width={0} />
        </marker>
      </defs>
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
        {#each data as country}
          <line
            x1={xScale(country.dropoutpre)}
            x2={xScale(country.dropoutpost)}
            y1={yScale(country.iso3c)}
            y2={yScale(country.iso3c)}
            stroke={Colors.ColorBaseRed600}
            style:marker-end={'url(#arrowhead-red)'}
          />
          {#if country.dropoutpre < country.dropoutpost}
            <circle cx={xScale(country.dropoutpre)} cy={yScale(country.iso3c)} r={LineChartCircleRadius} fill={Colors.ColorBaseRed600} />
            <text class={'number small'} x={xScale(country.dropoutpre) - 6} y={yScale(country.iso3c) + 4} dy={0} dx={0} text-anchor={'end'}
              ><Number value={country.dropoutpre} /></text
            >
            <text
              class={'number small'}
              x={xScale(country.dropoutpost) + 8}
              y={yScale(country.iso3c) + 4}
              dy={0}
              dx={0}
              text-anchor={'start'}><Number value={country.dropoutpost} /></text
            >
          {/if}
          {#if country.iso3c == 'BRA'}
            <text
              x={xScale(country.dropoutpre)}
              y={yScale(country.iso3c) - 10}
              fill={Colors.ColorBaseRed600}
              class={'category'}
              text-anchor={'middle'}>{precovid}</text
            >
          {/if}
          {#if country.iso3c == 'BRA'}
            <text
              x={xScale(country.dropoutpost) + 4}
              y={yScale(country.iso3c) - 10}
              fill={Colors.ColorBaseRed600}
              class={'category middle'}
              text-anchor={'middle'}>{postcovid}</text
            >
          {/if}
          <text class={'axis-label end'} x={xScale(0) - 18} y={yScale(country.iso3c) + 4}
            >{$_(`country.${country.iso3c.toLowerCase()}`)}</text
          >
        {/each}
      </g>
    </svg>
  {/if}
</div>
