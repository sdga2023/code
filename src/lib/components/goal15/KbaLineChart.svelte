<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveMonotoneX } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import LineChartMultiple from '../goal08/LineChartMultiple.svelte';

  export let data;
  export let yaxistitle;
  export let yaxisunits;
  export let mountain;
  export let terrestrial;
  export let freshwater;

  $: colorScale = [
    { key: 'ER_PTD_MTN', color: Colors.ColorVisPurple, label: mountain, dy: w < 500 ? 52 : 32 },
    { key: 'ER_PTD_TERR', color: Colors.ColorVisGreen, label: terrestrial, dy: w < 500 ? -24 : -4 },
    { key: 'ER_PTD_FRHWTR', color: Colors.ColorVisBlue, label: freshwater, dy: w < 500 ? -40 : -20 }
  ];

  let margins = {
    top: 40,
    right: 64,
    bottom: 24,
    left: 60
  };

  let w;
  let h = 500;

  $: xScale = scaleLinear()
    .domain([2000, 2021])
    .range([0, w - margins.left - margins.right]);
  $: xTicks = [2000, 2010, 2021];
  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [0, 25, 50, 75, 100];

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);
</script>

<div bind:clientWidth={w} class="linechart">
  {#if w}
    <svg class="vis" width={w} height={h}>
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
            yAxisTitle={yaxistitle}
            yAxisUnits={yaxisunits}
          />
        {/if}
      </g>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#if xScale && xTicks && w}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
          />
        {/if}

        {#each colorScale.map((d) => d.key) as series}
          <path
            d={lineGenerator(data.filter((d) => d.code == series))}
            fill="none"
            stroke={colorScale.find((d) => d.key == series).color}
            stroke-width={2}
          />
        {/each}

        {#each data.filter((d) => d.year == 2000) as label}
          <circle
            cx={xScale(label.year)}
            cy={yScale(label.value)}
            r={LineChartCircleRadius}
            stroke-width={1}
            stroke={'#ffffff'}
            fill={colorScale.find((d) => d.key == label.code).color}
          />
          <text
            class={`small number ${label.code}`}
            x={xScale(label.year) - 6}
            y={yScale(label.value) + 6}
            dy={label.code == 'ER_PTD_FRHWTR' ? -10 : label.code == 'ER_PTD_MTN' ? 8 : 0}
            fill={colorScale.find((d) => d.key == label.code).color}
            text-anchor={'end'}><Number value={label.value} digits={1} /></text
          >
        {/each}

        {#each data.filter((d) => d.year == 2010) as label}
          <circle
            cx={xScale(label.year)}
            cy={yScale(label.value)}
            r={LineChartCircleRadius}
            stroke-width={1}
            stroke={'#ffffff'}
            fill={colorScale.find((d) => d.key == label.code).color}
          />
          <text
            class={`small number ${label.code}`}
            x={xScale(label.year)}
            y={yScale(label.value) + 6}
            dy={label.code == 'ER_PTD_FRHWTR' ? -24 : label.code == 'ER_PTD_MTN' ? 10 : -14}
            fill={colorScale.find((d) => d.key == label.code).color}
            text-anchor={'middle'}><Number value={label.value} digits={1} /></text
          >
        {/each}

        {#each data.filter((d) => d.year == 2021) as label}
          <circle
            cx={xScale(label.year)}
            cy={yScale(label.value)}
            r={LineChartCircleRadius}
            stroke-width={1}
            stroke={'#ffffff'}
            fill={colorScale.find((d) => d.key == label.code).color}
          />
          <text
            class={`small number ${label.code}`}
            x={xScale(label.year) + 6}
            y={yScale(label.value) + 6}
            dy={label.code == 'ER_PTD_FRHWTR' ? -12 : 0}
            fill={colorScale.find((d) => d.key == label.code).color}><Number value={label.value} digits={1} unit="%" /></text
          >
          <text
            class={`category ${label.code}`}
            x={xScale(2015)}
            y={yScale(label.value)}
            dy={colorScale.find((d) => d.key == label.code).dy}
            fill={colorScale.find((d) => d.key == label.code).color}
            text-anchor={'middle'}>{colorScale.find((d) => d.key == label.code).label}</text
          >
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  .ER_PTD_MTN {
    fill: var(--color-vis-purple);
  }
  .ER_PTD_TERR {
    fill: var(--color-vis-green);
  }
  .ER_PTD_FRHWTR {
    fill: var(--color-vis-blue);
  }
</style>
