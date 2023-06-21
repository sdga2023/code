<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';

  export let data;
  export let walkingbiking;
  export let bus;
  export let rail;
  export let wheelers;
  export let car;
  export let taxi;
  export let xaxistitle;
  export let xaxisunits;
  export let lowrange;
  export let highrange;

  let modes = {
    walkingbiking: walkingbiking,
    bus: bus,
    rail: rail,
    wheelers: wheelers,
    car: car,
    taxi: taxi
  };

  let margins = {
    top: 50,
    right: 70,
    bottom: 40,
    left: 60
  };

  let w;
  let h = 400;

  $: xScale = scaleLinear()
    .range([0, w - margins.left - margins.right])
    .domain([0, 500]);
  const xTicks = [0, 500];

  const yScale = scaleBand()
    .range([h - margins.bottom - margins.top, 0])
    .domain(data.map((d) => d.mode))
    .paddingInner(0.5)
    .paddingOuter(0.5);
</script>

<div bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h}>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisTitle={xaxistitle}
          xAxisUnits={xaxisunits}
        />
        {#each data as mode}
          <rect
            x={xScale(mode.low)}
            y={yScale(mode.mode) - yScale.bandwidth() / 2}
            width={xScale(mode.high) - xScale(mode.low)}
            height={yScale.bandwidth()}
            fill={Colors.ColorBaseBlue400}
          />
          <text x={xScale(mode.high) + 4} y={yScale(mode.mode) + 4} class={'val small number'}>
            <Number value={mode.high} />
          </text>
          <text x={xScale(mode.low) - 4} y={yScale(mode.mode) + 4} class={'val small number'} text-anchor={'end'}>
            <Number value={mode.low} />
          </text>
          <text
            x={xScale(mode.low) + (xScale(mode.high) - xScale(mode.low)) / 2 + (mode.mode == 'walkingbiking' ? 16 : 0)}
            y={w < 550
              ? yScale(mode.mode) - yScale.bandwidth() + 8
              : mode.mode == 'walkingbiking'
              ? yScale(mode.mode) + yScale.bandwidth()
              : yScale(mode.mode) + 4}
            text-anchor={'middle'}
            class={'category' + (w >= 550 && mode.mode != 'walkingbiking' ? ' white' : '')}>{modes[mode.mode]}</text
          >
        {/each}
        <line class="connector" x1={xScale(145)} x2={xScale(145)} y1={-26} y2={yScale('taxi') - 16} />
        <line class="connector" x1={xScale(510)} x2={xScale(510)} y1={-26} y2={yScale('taxi') - 16} />

        <text class="small" x={xScale(145)} y={-30} text-anchor={'middle'}>{lowrange}</text>
        <text class="small" x={xScale(510)} y={-30} text-anchor={'middle'}>{highrange}</text>
      </g>
    </svg>
  {/if}
</div>

<style>
  line.connector {
    stroke: black;
    stroke-width: 1px;
  }
</style>
