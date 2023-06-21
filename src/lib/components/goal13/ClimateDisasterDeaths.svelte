<script>
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max, extent, min } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import ChartGrid from '../ChartGrid.svelte';

  export let data;
  export let yaxistitle;
  export let yaxisunits;

  let w;
  let h = 450;

  let margins = {
    top: 34,
    right: 20,
    bottom: 20,
    left: 22
  };

  let yMax = Math.ceil(max(data, (d) => d.deaths) / 1000000) * 1000000;

  $: xScale = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w - margins.left - margins.right]);
  const xTicks = [1900, 1950, 2000, 2021];
  $: yScale = scaleLinear()
    .domain([0, yMax])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [0, 1000000, 2000000, 3000000, 4000000];
  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.deaths))
    .curve(curveMonotoneX);
  $: areaGenerator = area()
    .x((d) => xScale(d.year))
    .y0(yScale(0))
    .y1((d) => yScale(d.deaths))
    .curve(curveMonotoneX);
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h} class="linechart">
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.right}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
        yAxisTitle={yaxistitle}
        yDivisor={1000000}
      />
    </g>
    <g transform={`translate(${margins.left},${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      <path
        d={areaGenerator(data)}
        stroke={'white'}
        stroke-width="{1.5}}"
        style:fill={Colors.ColorBaseBlue500}
        class="area"
        opacity={0.5}
      />
      <path d={lineGenerator(data)} stroke-width={2} stroke={Colors.ColorBaseBlue500} fill="none" />
    </g>
  </svg>
</div>
