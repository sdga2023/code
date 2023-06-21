<script>
  import { _ } from 'svelte-i18n';
  import ChartGrid from '../ChartGrid.svelte';
  import { scaleLinear, scaleTime, max, extent, line, scaleSequential, piecewise, interpolateLab, curveMonotoneX } from 'd3';
  import Legend from '../general/Legend.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let parentWidth;
  export let parentHeight;
  export let activeScene;
  export let labels;
  export let data = [];

  $: data2 = data
    .sort((a, b) => a.year - b.year || a.month_nr - b.month_nr)
    .map((d) => {
      return {
        ...d,
        date: new Date(d.year, d.month_nr - 1, 1),
        value: d.elevation_ft
      };
    });

  const margins = {
    top: 40,
    right: 10,
    bottom: 20,
    left: 20
  };

  $: width = parentWidth;
  $: height = parentHeight;

  $: w = parentWidth - margins.left - margins.right;
  $: h = height - margins.top - margins.bottom;

  $: x = scaleTime()
    .domain(extent(data2, (d) => d.date))
    .range([20, w]);

  $: y2 = scaleLinear().domain([0, 120]).range([h, 0]);

  $: l = line()
    .x((d) => x(d.date))
    .y((d) => y2(d.pct_of_full_capacity))
    .curve(curveMonotoneX);

  const ramp = piecewise(interpolateLab, [
    Colors.ColorBaseOrange500,
    Colors.ColorBaseYellow400,
    Colors.ColorGrey300,
    Colors.ColorBaseBlue200
  ]);

  let colorScale = scaleSequential(ramp).domain([0, 100]).clamp(true);
</script>

<div class="chart linechart svg-container" bind:clientWidth={width} bind:clientHeight={height}>
  <svg {width} {height}>
    <g transform="translate({margins.left}, {margins.top})">
      <g>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h}
          innerWidth={w}
          oppositeTickPosition={false}
          scale={scaleLinear()
            .domain(extent(data, (d) => d.year))
            .range([20, w])}
          ticks={x.ticks().map((d) => d.getFullYear())}
        />

        <ChartGrid
          oppositeTickPosition={false}
          gridType="yGrid"
          innerHeight={h}
          innerWidth={w}
          scale={y2}
          ticks={y2.ticks()}
          yAxisTitle={$_(labels['lake_capacity'])}
          yAxisUnits="%"
        />
      </g>

      {#each data2 as d}
        <rect
          x={x(d.date)}
          y={y2(d.pct_of_full_capacity)}
          width={x(data2[1].date) - x(data2[0].date)}
          height={y2(0) - y2(d.pct_of_full_capacity)}
          fill={colorScale(d.pct_of_full_capacity)}
          style:opacity={d.date.getFullYear() >= 2000 || activeScene.index <= 1 ? 1 : 0.4}
        />
      {/each}

      <rect x={x.range()[0]} y={y2(895)} width={x.range()[1] - x.range()[0]} height={y2(700) - y2(895)} class="annotated-area" />

      <path d={l(data2)} class="bg" />
      <path d={l(data2)} style:stroke="var(--color-base-blue700)" style:stroke-width={$isMobile ? 1.5 : 2.5} />

      {#if activeScene.index >= 1}
        <line class="emphasisbg" style:stroke-width={2} x1={x.range()[0]} x2={x.range()[1]} y1={y2(36)} y2={y2(36)} />
        <text x={x(new Date(2000, 0, 1))} y={y2(36) - 5} dx={-6} class="label stronger end">{$_(labels['tier_1'])}</text>

        <line class="emphasisbg" style:stroke-width={2} x1={x.range()[0]} x2={x.range()[1]} y1={y2(29)} y2={y2(29)} />
        <text x={x(new Date(2000, 0, 1))} y={y2(29) - 5} dx={-6} class="label stronger end">{$_(labels['tier_2'])}</text>

        <line class="emphasisbg" style:stroke-width={2} x1={x.range()[0]} x2={x.range()[1]} y1={y2(23)} y2={y2(23)} />
        <text x={x(new Date(2000, 0, 1))} y={y2(23) - 5} dx={-6} class="label stronger end">{$_(labels['tier_3'])}</text>
      {/if}
    </g>
  </svg>
</div>
<Legend color={colorScale} title={$_(labels['pct_of_full_capacity'])} units="%" />

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
  rect {
    transition: opacity 1s;
  }
</style>
