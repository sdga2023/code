<script>
  import { line, area, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let activeScene;
  export let parentHeight;
  export let parentWidth;

  const xLimitMax = tweened(1850, {
    duration: 1500,
    easing: cubicInOut
  });
  const xLimitMin = tweened(0, {
    duration: 1500,
    easing: cubicInOut
  });

  let margins = {
    top: 20,
    right: 40,
    bottom: 20,
    left: 10
  };

  $: reconstructed = data ? data.filter((d) => d.series == 'reconstructed') : [];
  $: observed = data ? data.filter((d) => d.series == 'observed') : [];

  $: w = parentWidth;
  $: h = parentHeight;

  $: xScale = scaleLinear()
    .domain([$xLimitMin, $xLimitMax])
    .range([0, w - margins.left - margins.right]);
  $: xTicks = [
    200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020, 2040, 2060, 2080, 2100
  ];

  $: yScale = scaleLinear()
    .domain([-1, 2])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [-2, -1, 0, 1, 2, 3, 4, 5];

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.temp))
    .curve(curveNatural);
  $: areaGenerator = area()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(d.x5))
    .y1((d) => yScale(d.x95))
    .curve(curveNatural);

  $: if (activeScene.index === 0) {
    $xLimitMin = 0;
    $xLimitMax = 1850;
    xTicks = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800];
  }
  $: if (activeScene.index === 1) {
    $xLimitMin = 0;
    $xLimitMax = 2020;
    xTicks = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];
  }
  $: if (activeScene.index === 2) {
    $xLimitMin = 1850;
    $xLimitMax = 2020;
    xTicks = [
      200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 1850, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020, 2040, 2060, 2080, 2100
    ];
  }
  $: if (activeScene.index === 3) {
    $xLimitMin = 1850;
    $xLimitMax = 2020;
    xTicks = [
      200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020, 2040, 2060, 2080, 2100
    ];
  }
</script>

<div class="temp-scroller svg-container linechart" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h}>
    <g transform={`translate(${margins.top},${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={yScale}
        ticks={yTicks}
      />
      {#if areaGenerator}
        <path d={areaGenerator(reconstructed)} stroke-width={0} style:fill={Colors.ColorVisTeal} opacity={0.2} />
      {/if}
      {#if lineGenerator}
        <path d={lineGenerator(reconstructed)} stroke={Colors.ColorVisTeal} />
      {/if}
      {#if lineGenerator && activeScene.index > 0}
        <path d={lineGenerator(observed)} class="bg" />
        <path d={lineGenerator(observed)} stroke={Colors.ColorBaseRed400} />
      {/if}

      {#if activeScene.index > 2}
        <line
          x1={0}
          x2={w - margins.right}
          y1={yScale(1.5)}
          y2={yScale(1.5)}
          stroke-width={1.5}
          style:stroke={Colors.ColorThemeText}
          transition:fade|local
        />
        <text class="number" x={xScale(1960)} y={yScale(1.5) - 4}>1.5°C</text>
        <line
          x1={0}
          x2={w - margins.right}
          y1={yScale(2)}
          y2={yScale(2)}
          stroke-width={1.5}
          style:stroke={Colors.ColorThemeText}
          transition:fade|local
        />
        <text class="number" x={xScale(1960)} y={yScale(2) - 4}>2°C</text>
      {/if}
    </g>
  </svg>
</div>

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
