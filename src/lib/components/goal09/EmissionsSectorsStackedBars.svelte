<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { stack } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let transport;
  export let other;
  export let industry;
  export let buildings;
  export let yaxisunits;

  const colorScale = {
    transport: { color: Colors.ColorBaseOrange300, label: transport },
    industry: { color: Colors.ColorBaseBlue300, label: industry },
    buildings: { color: Colors.ColorBaseBlue500, label: buildings },
    other: { color: Colors.ColorGrey300, label: other }
  };

  const years = [1990, 2000, 2010, 2020];

  const stackedData = stack().keys(Object.keys(colorScale));

  let margins = {
    top: 20,
    right: 5,
    bottom: 20,
    left: 20
  };

  let w;
  let h = 500;

  $: padding = $isMobile ? 0.1 : 0.3;

  $: xScale = scaleBand()
    .domain(years)
    .range([0, w - margins.left - margins.right])
    .paddingInner(padding);

  $: yScale = scaleLinear()
    .domain([0, 30000000])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 10000000, 20000000, 30000000];
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        scale={yScale}
        innerHeight={h - margins.top}
        innerWidth={w - margins.right}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
        yDivisor={1000000}
      />
    </g>
    <g transform={`translate(${margins.left},${margins.top})`}>
      {#each years as year}
        {#each stackedData(data.filter((d) => d.year == year)) as category}
          <rect
            x={xScale(year)}
            y={yScale(category[0][1])}
            height={yScale(category[0][0]) - yScale(category[0][1])}
            width={xScale.bandwidth()}
            fill={colorScale[category.key].color}
            stroke={'white'}
            stroke-width={'1px'}
          />
          <text
            class="number white"
            y={yScale(category[0][0]) + (yScale(category[0][1]) - yScale(category[0][0])) / 2 + 6}
            x={xScale(year) + xScale.bandwidth() / 2}
            text-anchor={'middle'}><Number value={category[0].data[category.key] / 1000000} digits={1} /></text
          >
          {#if year == 2020}
            <text
              class="category middle white"
              style:fill={category.key === 'other' ? '#000000' : '#ffffff'}
              x={xScale(year) + xScale.bandwidth() / 2}
              y={yScale(category[0][0]) + (yScale(category[0][1]) - yScale(category[0][0])) / 2 - 16}>{colorScale[category.key].label}</text
            >
          {/if}
        {/each}
        <text class="small weaker" x={xScale(year) + xScale.bandwidth() / 2} y={yScale(0) + 20} text-anchor={'middle'}>{year} </text>
      {/each}
    </g>
  </svg>
</div>
