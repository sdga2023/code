<script>
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import { _ } from 'svelte-i18n';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let england;
  //export let activeScene;
  export let parentWidth;
  //export let parentHeight;
  export let xaxistitle;
  export let xaxisunits;
  export let yaxistitle;
  export let yaxisunits;

  let activeScene = { index: 1 };

  $: margins = {
    top: 32,
    right: 10,
    bottom: 34,
    left: $isMobile ? 45 : 20
  };

  $: w = parentWidth > 800 ? 800 : parentWidth;
  //$: h = parentHeight > 600 ? 600 : parentHeight;
  let h = 750;

  $: radius = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;

  $: xScale = scaleLinear()
    .domain([0, 60])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [0, 20, 40, 60];
  $: yScale = scaleLinear()
    .domain([0, 2])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 0.5, 1, 1.5, 2];

  const leftLabels = ['BEL', 'DNK'];
</script>

{#if w}
  <svg width={w} height={h} class="scatterplot">
    <g transform={`translate(${margins.left - 20}, ${margins.top})`}>
      {#if activeScene && activeScene.index > 0}
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right + 16}
          scale={yScale}
          ticks={yTicks}
          yAxisUnits={yaxisunits}
          yAxisTitle={yaxistitle}
        />
      {/if}
    </g>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
        xAxisTitle={xaxistitle}
        hideLines={activeScene && activeScene.index == 0}
      />
      {#each data as point}
        <circle
          transform={`translate(${xScale(point.closurelength)}, ${
            activeScene && activeScene.index == 0 ? yScale(0) : yScale(-point.yearslost)
          })`}
          cx={0}
          cy={0}
          r={radius}
          fill={Colors.ColorBaseBlue500}
        />
        <text
          class="geo small"
          transform={`translate(
              ${leftLabels.includes(point.iso3c) ? xScale(point.closurelength) - 8 : xScale(point.closurelength) + 8},
              ${activeScene && activeScene.index == 0 ? yScale(0) : yScale(-point.yearslost) + 4})
              `}
          x={0}
          y={0}
          dy={point.iso3c == 'AUS' ? -8 : point.iso3c == 'DNK' ? 8 : 0}
          text-anchor={leftLabels.includes(point.iso3c) ? 'end' : 'start'}
          opacity={activeScene && activeScene.index == 0 ? 0 : 1}
          >{point.iso3c == 'ENGLAND' ? england : $_(`country.${point.iso3c.toLowerCase()}`)}</text
        >
      {/each}
    </g>
  </svg>
{/if}

<style>
  svg {
    margin: auto;
  }
  circle {
    transition: transform 1.5s;
  }
  text.label {
    transition: transform 1.5s, opacity 1.5s;
  }
</style>
