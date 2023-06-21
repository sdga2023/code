<script>
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max, extent, min } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import ChartGrid from '../ChartGrid.svelte';

  export let data;
  export let type;
  export let yaxistitle;
  export let title;
  export let units;

  let w;
  let h = 250;

  const colours = {
    deaths: Colors.ColorBasePurple700,
    victims: Colors.ColorBaseOrange500,
    damage: Colors.ColorBaseTeal500
  };

  let margins = {
    top: 14,
    right: 20,
    bottom: 20,
    left: 22
  };

  let yMax =
    title == 'Deaths'
      ? Math.ceil(max(data, (d) => d[type]) / 1000000) * 1000000
      : Math.ceil(max(data, (d) => d[type]) / 100000000) * 100000000;

  $: xScale = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w - margins.left - margins.right]);
  const xTicks = [1900, 1950, 2000, 2021];
  $: yScale = scaleLinear()
    .domain([0, yMax])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks =
    title == 'Total affected'
      ? [0, 350000000, 700000000]
      : title == 'Deaths'
      ? [0, 1000000, 2000000, 3000000, 4000000]
      : [0, 100000000, 200000000, 300000000, 400000000];
  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d[type]))
    .curve(curveMonotoneX);
  $: areaGenerator = area()
    .x((d) => xScale(d.year))
    .y0(yScale(0))
    .y1((d) => yScale(d[type]))
    .curve(curveMonotoneX);
</script>

<p class="label title caps">{title}</p>
<div bind:clientWidth={w}>
  <svg width={w} height={h} class="linechart">
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.right}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={units}
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
      <path d={areaGenerator(data)} stroke={'white'} stroke-width="{1.5}}" style:fill={colours[type]} class="area" opacity={0.5} />
      <path d={lineGenerator(data)} stroke-width={2} stroke={colours[type]} fill="none" />
    </g>
  </svg>
</div>
