<script>
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max, extent, min } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import * as Tokens from '$lib/styles/vis.js';
  import Number from './../general/Number.svelte';
  import ChartGrid from './../ChartGrid.svelte';
  import Lens from '../general/Lens.svelte';

  export let data;
  export let covid;

  $: projectionData = data.filter((d) => d.year > 2021);

  let w;
  let h = 400;

  let margins = {
    top: 24,
    right: 16,
    bottom: 24,
    left: 24
  };
  let xScale;
  let yScale;
  let lineGenerator;
  let areaGenerator;

  $: if (data)
    xScale = scaleLinear()
      .domain(extent(data, (d) => d.year))
      .range([0, w - margins.left - margins.right]);
  const xTicks = [2015, 2020, 2025, 2030];
  $: if (data)
    yScale = scaleLinear()
      .domain([0, 800])
      .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 250, 500, 750];
  $: if (xScale && yScale)
    lineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.million_poor))
      .curve(curveMonotoneX);
  $: if (xScale && yScale)
    areaGenerator = area()
      .x((d) => xScale(d.year))
      .y0(yScale(0))
      .y1((d) => yScale(d.million_poor))
      .curve(curveMonotoneX);

  $: labels = data.filter((d) => [2015, 2019, 2020, 2025, 2030].includes(d.year));
</script>

<div class="poverty-projection" bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h} class="linechart">
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
          />
        {/if}
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if xScale && xTicks && w}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
            hideLines="true"
          />
        {/if}
        {#if xScale && yScale}
          <path d={areaGenerator(data)} style:fill={Colors.ColorVisBinaryNeg} class="area" />
          <path d={lineGenerator(data)} class="bg" />
          <path d={lineGenerator(data)} style:stroke={Colors.ColorVisBinaryNeg} />
          <path d={lineGenerator(projectionData)} style:stroke={'white'} class="projection" />

          {#each labels as label}
            <circle
              cx={xScale(label.year)}
              cy={yScale(label.million_poor)}
              r={Tokens.LineChartCircleRadius}
              fill={Colors.ColorVisBinaryNeg}
            />
            <text
              x={xScale(label.year)}
              y={label.year == 2019 ? yScale(label.million_poor) + 20 : yScale(label.million_poor) - 6}
              class="number middle"><Number value={label.million_poor} /></text
            >
          {/each}
        {/if}
        <Lens x={xScale(2019.5)} y={yScale(684)} r={60} />
        <text x={xScale(2019.5)} y={yScale(500)} text-anchor={'middle'}>{covid}</text>
      </g>
    </svg>
  {/if}
</div>
