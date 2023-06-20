<script>
  import { line, area, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import { max } from 'd3';

  export let data;
  export let disaster;
  export let yaxistitle;

  const height = 450;

  let margins = {
    top: 14,
    right: 12,
    bottom: 30,
    left: 24
  };
  let w;
  let h = height;

  let yMax = Math.ceil(max(data, (d) => d.number) / 50) * 50;

  $: xScale = scaleLinear()
    .domain([1970, 2021])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [1970, 1980, 1990, 2000, 2010, 2021];
  const yScale = scaleLinear()
    .domain([0, yMax])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = yScale.ticks(4);
  $: areaGenerator = area()
    .x((d) => xScale(d.year))
    .y0(() => yScale(0))
    .y1((d) => yScale(d.number))
    .curve(curveNatural);
  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.number))
    .curve(curveNatural);
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
        yAxisTitle={yaxistitle}
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
        class="area"
        style:fill={Colors.ColorBasePurple500}
        opacity={0.5}
      />
      <path d={lineGenerator(data)} stroke-width={2} stroke={Colors.ColorBasePurple500} fill="none" />
    </g>
  </svg>
</div>
