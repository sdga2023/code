<script>
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max, extent, min } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';

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

  $: if (data)
    xScale = scaleLinear()
      .domain(extent(data, (d) => d.year))
      .range([0, w - margins.left - margins.right]);
  $: if (data)
    yScale = scaleLinear()
      .domain([0, max(data, (d) => d[metric])])
      .range([h - margins.top - margins.bottom, 0]);
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

  $: labels = data ? data.filter((d) => [min(data, (d) => d.year), 2019, 2020, 2021].includes(d.year)) : [];
</script>

<div class="airtraffic-multiple linechart" bind:clientWidth={w}>
  {#if w}
    <p class="label title caps">{metricsMap[metric]}</p>
    <svg width={w} height={h}>
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if xScale && yScale}
          <text x={xScale(min(data, (d) => d.year))} y={yScale(0) + 12} class="axis-label small middle">{min(data, (d) => d.year)}</text>
          <text x={xScale(2021)} y={yScale(0) + 12} class="axis-label small middle">2021</text>

          <path d={areaGenerator(data)} style:fill={Colors.ColorBaseBlue500} class="area" />
          <path d={lineGenerator(data)} class="bg" />
          <path d={lineGenerator(data)} stroke={Colors.ColorBaseBlue500} />

          {#each labels as label}
            <circle cx={xScale(label.year)} cy={yScale(label[metric])} r={LineChartCircleRadius} fill={Colors.ColorBaseBlue500} />
            {#if label.year != min(data, (d) => d.year) && label.year != 2021}
              <text
                x={xScale(label.year)}
                y={label.year == 2019 ? yScale(label[metric]) - 8 : yScale(label[metric]) + 15}
                class="small number middle"><Number value={label[metric]} /></text
              >
            {/if}
            <!--
             {#if label.year == 2019}
              <text x={xScale(label.year)} y={yScale(label[metric]) - 18} class="caps stronger data-label">{metricsMap[metric]}</text>
              >
            {/if}-->
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>

<style>
</style>
