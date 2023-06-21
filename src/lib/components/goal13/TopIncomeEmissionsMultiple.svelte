<script>
  import { scaleLinear } from 'd3-scale';
  import { area, curveMonotoneX } from 'd3-shape';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import ChartGrid from '../ChartGrid.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let type;
  export let topemitters;
  export let restofworld;
  export let units;
  export let projection;
  export let target;

  let w;
  let h = 300;

  let margins = {
    top: 40,
    right: 14,
    bottom: 20,
    left: 18
  };
  let xScale;
  let yScale;
  let areaGenerator;

  const colorScale = [
    Colors.ColorBaseOrange300,
    Colors.ColorBaseOrange500,
    Colors.ColorVisIncomeLow,
    Colors.ColorVisIncomeLowerMiddle,
    Colors.ColorVisIncomeUpperMiddle,
    Colors.ColorVisIncomeHigh
  ];

  $: xScale = scaleLinear()
    .domain([1990, 2050])
    .range([0, w - margins.left - margins.right]);
  $: yScale = scaleLinear()
    .domain([0, 50000])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [0, 5594, 25000, 50000];

  $: if (xScale && yScale)
    areaGenerator = area()
      .x((d) => xScale(d.data.year))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(curveMonotoneX);
</script>

<div class="top-income-multiple stacked-area" bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h}>
      <g transform={`translate(0,${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScale}
          ticks={yTicks}
          yDivisor={1000}
          yAxisUnits={units}
        />
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if xScale && yScale}
          <text x={xScale(1990)} y={yScale(0) + 14} class="axis-label small weaker no-stroke">1990</text>
          <text x={xScale(2021)} y={yScale(0) + 14} class="axis-label small weaker no-stroke">2021</text>
          <text x={xScale(2050)} y={yScale(0) + 14} class="axis-label small weaker no-stroke">2050</text>
          {#each data as series, i}
            <path d={areaGenerator(series)} fill={type == 'toprest' ? colorScale[i] : colorScale[i + 2]} />
          {/each}
          <rect
            x={xScale(2021)}
            y={yScale(50000)}
            width={xScale(2050) - xScale(2021)}
            height={yScale(0) - yScale(50000)}
            fill={Colors.ColorThemeBgWeaker}
            opacity={0.6}
          />
          <rect
            class="annotated-area"
            x={xScale(2021)}
            y={yScale(50000)}
            width={xScale(2050) - xScale(2021)}
            height={yScale(0) - yScale(50000)}
          />
          <text class="small caps" x={xScale(2050) - 10} y={20} text-anchor={'end'}>{projection}</text>
          <text class="small white stronger" x={xScale(1990) + 5} y={yScale(5594) + 14}>{target}</text>

          <line x1={xScale(2021)} x2={xScale(2021)} y1={0} y2={h - margins.top - margins.bottom} stroke={'white'} stroke-width={1.5} />
          <line x1={xScale(1990)} x2={xScale(2050)} y1={yScale(5594)} y2={yScale(5594)} stroke={'white'} stroke-width={1.5} />
        {/if}
      </g>
    </svg>
  {/if}
  {#if type == 'toprest'}
    <CategoricalLegend
      legendType="custom"
      customItems={[
        { key: topemitters, colour: Colors.ColorBaseOrange500 },
        { key: restofworld, colour: Colors.ColorBaseOrange300 }
      ]}
    />
  {/if}
  {#if type == 'income'}
    <CategoricalLegend legendType="income" />
  {/if}
</div>

<style>
  .axis-label {
    text-anchor: middle;
    stroke-width: 3px;
    stroke: #ffffff;
    paint-order: stroke;
    stroke-linejoin: round;
  }
</style>
