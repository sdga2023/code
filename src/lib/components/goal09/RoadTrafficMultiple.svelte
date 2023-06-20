<script>
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max, extent, min, ticks } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import Lens from './../general/Lens.svelte';
  import ChartGrid from './../ChartGrid.svelte';

  export let data;
  export let city;
  export let citiesMap;
  $: cityData = data.filter((d) => d.city == city);

  let w;
  let h = 250;

  let margins = {
    top: 26,
    right: 0,
    bottom: 24,
    left: 42
  };
  let xScale;
  let yScale;
  let lineGenerator;
  let areaGenerator;

  $: if (data)
    xScale = scaleTime()
      .domain([new Date('2019-04-21'), new Date('2022-01-01')])
      .range([0, w - margins.left - margins.right]);
  $: if (cityData)
    yScale = scaleLinear()
      .domain([0, max(cityData, (d) => d.alerts)])
      .range([h - margins.top - margins.bottom, 0]);
  $: if (xScale && yScale)
    lineGenerator = line()
      .x((d) => xScale(new Date(d.week)))
      .y((d) => yScale(d.alerts))
      .curve(curveMonotoneX);
  $: if (xScale && yScale)
    areaGenerator = area()
      .x((d) => xScale(new Date(d.week)))
      .y0(yScale(0))
      .y1((d) => yScale(d.alerts))
      .curve(curveMonotoneX);
</script>

<div class="roadtraffic-multiple linechart" bind:clientWidth={w}>
  <div class="title caps">{citiesMap[city]}</div>
  {#if w && cityData && xScale}
    <svg width={w} height={h}>
      <g transform={`translate(0,${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          scale={yScale}
          innerHeight={h}
          innerWidth={w - margins.right}
          ticks={city == 'mumbai' ? [0, 200, 400, 600] : [0, 50000, 100000, 150000, 200000]}
        />
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if xScale && yScale && cityData}
          <path d={areaGenerator(cityData)} style:fill={Colors.ColorBaseRed500} class="area" />
          <path d={lineGenerator(cityData)} class="bg" />
          <path d={lineGenerator(cityData)} style:stroke={Colors.ColorBaseRed500} />
          <Lens x={xScale(new Date('2020-03-15'))} y={yScale(cityData.find((d) => d.week == '2020-03-22T00:00:00.000Z').alerts)} r={20} />
        {/if}
        {#each ['2020-01-01', '2021-01-01'] as xTick}
          <!--  <line
            x1={xScale(new Date(xTick))}
            x2={xScale(new Date(xTick))}
            y1={-16}
            y2={yScale(0)}
            stroke={Colors.ColorGrey200}
            stroke-width={1}
            opacity={0.5}
          />-->
          <text x={xScale(new Date(xTick)) + 2} y={h - 30} text-anchor="middle" class="small weaker">{xTick.slice(0, 4)}</text>
        {/each}
      </g>
    </svg>
  {/if}
</div>
