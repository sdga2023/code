<script>
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max, extent, min } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import ChartGrid from '../ChartGrid.svelte';

  export let data;
  export let metric;
  export let metricsMap;

  let w;
  let h = 250;

  let margins = {
    top: 40,
    right: 50,
    bottom: 20,
    left: 20
  };
  let xScale;
  let yScale;
  let lineGenerator;
  let areaGenerator;

  $: xScale = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w - margins.left - margins.right]);
  $: yScale = scaleLinear()
    .domain([0, max(data, (d) => d[metric])])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = metric == 'deaths' ? [0, 4000000] : [0, 200000000, 400000000];
  $: if (xScale && yScale)
    lineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d[metric]))
      .curve(curveMonotoneX);
  $: if (xScale && yScale)
    areaGenerator = area()
      .x((d) => xScale(d.year))
      .y0(yScale(0))
      .y1((d) => yScale(d[metric]))
      .curve(curveMonotoneX);

  //$: labels = data ? data.filter((d) => [min(data, (d) => d.year), 2019, 2020].includes(d.year)) : [];
</script>

<div class="disaster-damage-multiple" bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h}>
      <g transform={`translate(0,${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={yScale}
          ticks={yTicks}
        />
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if xScale && yScale}
          <text x={xScale(min(data, (d) => d.year))} y={yScale(0) + 14} class="axis-label small">{min(data, (d) => d.year)}</text>
          <text x={xScale(2021)} y={yScale(0) + 14} class="axis-label small">2021</text>
          {#each data as point}
            <circle
              cx={xScale(point.year)}
              cy={yScale(point[metric])}
              r={3}
              fill={Colors.ColorThemePrimary}
              stroke={'white'}
              stroke-width={1}
            />
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>
