<script>
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveMonotoneX } from 'd3-shape';
  import { max } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import ChartGrid from './../ChartGrid.svelte';

  export let data;
  export let title;
  export let xaxistitle;
  export let yaxistitle;
  export let yaxisunits;
  export let predicted;
  export let observed;
  export let showLabels;
  export let metric;

  $: predictedData = data.filter((d) => d.key == 'predic');
  $: observedData = data.filter((d) => d.key == 'observed');

  let w;
  let h = 250;

  let margins = {
    top: 30,
    right: 20,
    bottom: 40,
    left: 20
  };
  let xScale;
  let yScale;
  let lineGenerator;
  let areaGenerator;

  $: xScale = scaleLinear()
    .domain([-25, max(data, (d) => d.dateRel)])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [0, 25, 50, 75, 100];
  $: yScale = scaleLinear()
    .domain([0, metric == 'o3' ? 160 : max(data, (d) => d.predUpr)])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [yScale.ticks()[0], yScale.ticks()[yScale.ticks().length - 1] / 2, yScale.ticks()[yScale.ticks().length - 1]];
  $: if (xScale && yScale)
    lineGenerator = line()
      .x((d) => xScale(d.dateRel))
      .y((d) => yScale(d.val))
      .curve(curveMonotoneX);
  $: if (xScale && yScale)
    areaGenerator = area()
      .x((d) => xScale(d.dateRel))
      .y0((d) => yScale(d.predLwr))
      .y1((d) => yScale(d.predUpr))
      .curve(curveMonotoneX);
</script>

<div class="airpollution-multiple linechart" bind:clientWidth={w}>
  <div class="title">{title}</div>
  {#if w}
    <svg width={w} height={h}>
      <g transform={`translate(0,${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          scale={yScale}
          innerHeight={h - margins.top}
          innerWidth={w - margins.right}
          ticks={yTicks}
          yAxisTitle={yaxistitle}
          yAxisUnits={yaxisunits}
        />
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          scale={xScale}
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          ticks={xTicks}
          xAxisTitle={xaxistitle}
        />
        {#if xScale && yScale}
          <path d={areaGenerator(predictedData)} style:fill={Colors.ColorBaseRed500} class="area" />
          <path d={lineGenerator(predictedData)} style:stroke={Colors.ColorBaseRed500} class="projection" />

          <path d={lineGenerator(observedData)} class="bg" />
          <path d={lineGenerator(observedData)} style:stroke={Colors.ColorBaseBlue300} />
          <line x1={xScale(0)} x2={xScale(0)} y1={0} y2={yScale(0) + 3} stroke={'black'} stroke-width={1.5} />

          {#if showLabels}
            <text x={xScale(40)} y={yScale(35)} text-anchor={'middle'} style:fill={Colors.ColorBaseRed500}>{predicted}</text>
            <text x={xScale(40)} y={yScale(11)} text-anchor={'middle'} style:fill={Colors.ColorBaseBlue300}>{observed}</text>
          {/if}
        {/if}
      </g>
    </svg>
  {/if}
</div>
