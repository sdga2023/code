<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveMonotoneX } from 'd3-shape';
  import { extent, min } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from '../general/Number.svelte';
  import ChartGrid from '../ChartGrid.svelte';
  import { regressionLoess } from 'd3-regression';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let yaxistitle;
  export let yaxisunits;

  let w;
  let h = 450;

  let margins = {
    top: 0,
    right: 20,
    bottom: 20,
    left: 20
  };
  let xScale;
  let yScale;
  let lineGenerator;

  $: xScale = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w - margins.left - margins.right]);
  const xTicks = [1900, 1950, 2000, 2021];
  $: yScale = scaleLinear()
    .domain([0, 450000000])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 200000000, 400000000];

  const victimsRegression = regressionLoess()
    .x((d) => d.year)
    .y((d) => d.victims)
    .bandwidth(0.5);
  const damageRegression = regressionLoess()
    .x((d) => d.year)
    .y((d) => d.damage)
    .bandwidth(0.5);
  $: if (xScale && yScale)
    lineGenerator = line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(curveMonotoneX);

  let hoverData;

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
</script>

<div bind:clientWidth={w} on:mousemove={updateMouse} class="linechart">
  <CategoricalLegend
    top={true}
    legendType="custom"
    customItems={[
      { key: 'Victims', colour: Colors.ColorVisRed },
      { key: 'Damage ($)', colour: Colors.ColorVisTeal }
    ]}
  />
  {#if w}
    <svg width={w} height={h}>
      <g transform={`translate(0,${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w}
          scale={yScale}
          ticks={yTicks}
          yAxisTitle={yaxistitle}
          yAxisUnits={yaxisunits}
          yDivisor={1000000}
        />
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w}
          scale={xScale}
          ticks={xTicks}
          hideLines={true}
        />
        {#if xScale && yScale}
          <path d={lineGenerator(victimsRegression(data))} fill="none" stroke={Colors.ColorVisRed} style:stroke-width={1} />
          <path d={lineGenerator(damageRegression(data))} fill="none" stroke={Colors.ColorVisTeal} style:stroke-width={1} />
          {#each data as point}
            <line
              x1={xScale(point.year)}
              y1={Math.min(yScale(point.damage), yScale(point.victims))}
              x2={xScale(point.year)}
              y2={yScale(0)}
              stroke={hoverData == point ? Colors.ColorGrey400 : 'transparent'}
            />
            <circle
              cx={xScale(point.year)}
              cy={yScale(point.damage)}
              r={hoverData == point ? 5 : LineChartCircleRadius}
              fill={Colors.ColorVisTeal}
              style:stroke={hoverData == point ? 'black' : 'white'}
              style:stroke-width={hoverData == point ? 2 : 1}
              on:mouseover={() => (hoverData = point)}
              on:mouseout={() => (hoverData = null)}
              on:focus={() => (hoverData = point)}
              on:blur={() => (hoverData = null)}
            />
            <circle
              cx={xScale(point.year)}
              cy={yScale(point.victims)}
              r={hoverData == point ? 5 : LineChartCircleRadius}
              fill={Colors.ColorVisRed}
              style:stroke={hoverData == point ? 'black' : 'white'}
              style:stroke-width={hoverData == point ? 2 : 1}
              on:mouseover={() => (hoverData = point)}
              on:mouseout={() => (hoverData = null)}
              on:focus={() => (hoverData = point)}
              on:blur={() => (hoverData = null)}
            />
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
  {#if hoverData && mousePos}
    <Tooltip visible={true} targetPos={mousePos}>
      <p>
        <span class="label caps stronger">{hoverData.year}</span>
      </p>
      <p>
        <span class="label stronger"><Number value={hoverData.victims} /></span>
      </p>
      <p class="label small weaker">{'Number of deaths and affected people'}</p>
      <hr />
      <p>
        <span class="label stronger"><Number value={hoverData.damage} unit="$" /></span>
      </p>
      <p class="label small weaker">{'Economical damage'}</p>
    </Tooltip>
  {/if}
</div>

<style>
  path {
    pointer-events: none;
  }
</style>
