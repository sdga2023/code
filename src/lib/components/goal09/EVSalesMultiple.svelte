<script>
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max, extent, min } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';

  export let data;
  export let metric;
  export let outsidechina;

  let w;
  let h = 300;

  let margins = {
    top: 0,
    right: 43,
    bottom: 20,
    left: 20
  };

  let colorScale = {
    HIC: Colors.ColorVisIncomeHigh,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    LIC: Colors.ColorVisIncomeLow
  };

  let xScale;
  let yScale;
  let lineGenerator;
  let areaGenerator;
  let chinaLineGenerator;

  $: if (data && w)
    xScale = scaleLinear()
      .domain(extent(data, (d) => d.year))
      .range([0, w - margins.left - margins.right]);
  $: if (data)
    yScale = scaleLinear()
      .domain([0, 2000000])
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

  $: labels = data ? data.filter((d) => d.year == max(data, (d) => d.year)) : [];

  $: if (xScale && yScale)
    chinaLineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d['UMC'] - d['CHN']))
      .curve(curveMonotoneX);
</script>

<div class="evsales-multiple linechart" bind:clientWidth={w}>
  <p class="title">{$_(`income.${metric}`)}</p>
  <svg width={w} height={h}>
    <g transform={`translate(${margins.left},${margins.top})`}>
      {#if xScale && yScale}
        <text x={xScale(min(data, (d) => d.year))} y={yScale(0) + 16} class="axis-label small weaker">{min(data, (d) => d.year)}</text>
        <text x={xScale(2020)} y={yScale(0) + 16} class="axis-label small weaker">2020</text>

        <path d={areaGenerator(data)} style:fill={colorScale[metric]} class="area" />
        <path d={lineGenerator(data)} stroke={colorScale[metric]} class="bg" />
        <path d={lineGenerator(data)} stroke={colorScale[metric]} />

        {#if metric == 'UMC'}
          <path d={chinaLineGenerator(data)} stroke={Colors.ColorVisReference} class="bg" />
          <path d={chinaLineGenerator(data)} stroke={Colors.ColorVisReference} />
        {/if}

        {#each labels as label}
          <circle cx={xScale(label.year)} cy={yScale(label[metric])} r={4} fill={colorScale[metric]} stroke={'#ffffff'} stroke-width={1} />
          <text x={xScale(label.year)} y={yScale(label[metric]) - 8} class="small data-label number" style:fill={colorScale[metric]}
            ><Number value={label[metric]} /></text
          >

          {#if metric == 'UMC'}
            <circle
              cx={xScale(label.year)}
              cy={yScale(label['UMC'] - label['CHN'])}
              r={4}
              fill={Colors.ColorVisReference}
              stroke={'#ffffff'}
              stroke-width={1}
            />
            <text
              x={xScale(label.year)}
              y={yScale(label['UMC'] - label['CHN']) - 8}
              class="small data-label number"
              style:fill={Colors.ColorVisReference}><Number value={label['UMC'] - label['CHN']} /></text
            >
            <text
              x={xScale(label.year) - 10}
              y={yScale(label['UMC'] - label['CHN']) - 24}
              class="small data-label"
              style:fill={Colors.ColorVisReference}>{outsidechina}</text
            >
          {/if}
        {/each}
      {/if}
    </g>
  </svg>
</div>

<style>
  .evsales-multiple {
    width: 100%;
  }
  .axis-label,
  .data-label {
    text-anchor: middle;
    stroke-width: 3px;
    stroke: #ffffff;
    paint-order: stroke;
    stroke-linejoin: round;
  }
  svg {
    overflow: visible;
  }
</style>
