<script>
  import { scaleLinear } from 'd3-scale';
  import { line, area, curveNatural, curveCatmullRom } from 'd3-shape';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import ChartGrid from './../ChartGrid.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let region;
  export let height;
  export let gap;
  export let pp;

  let margins = {
    top: 0,
    right: 14,
    bottom: 16,
    left: 16
  };

  let w;
  let h = height;

  $: lineData = data ? data.filter((d) => d.iso3c == region && d.year > 2014) : [];

  $: xScale = scaleLinear()
    .domain([2015, 2022])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2015, 2020, 2022];
  let yDomain = [0, 22];
  $: yScale = scaleLinear()
    .domain(yDomain)
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 10, 20];

  $: femaleLineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.female))
    .curve(curveCatmullRom);
  $: maleLineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.male))
    .curve(curveCatmullRom);
  $: areagenerator = area()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(d.female))
    .y1((d) => yScale(d.male))
    .curve(curveCatmullRom);

  let currentYear;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  $: yearData = lineData.find((d) => d.year == currentYear);
</script>

<div class="linechart" bind:clientWidth={w}>
  <p class="label caps title">{$_(`region.${region}`)}</p>
  {#if w}
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
          />
        {/if}
      </g>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#if xScale && xTicks && w}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
          />
        {/if}
        <path d={areagenerator(lineData)} style:fill={Colors.ColorThemeBgWeakest} />
        <path d={femaleLineGenerator(lineData)} stroke={Colors.ColorVisGenderFemale} />
        <path d={maleLineGenerator(lineData)} stroke={Colors.ColorVisGenderMale} />
        {#if yearData}
          <circle cx={xScale(yearData.year)} cy={yScale(yearData.female)} r={5} fill={'none'} class="emphasis" />
          <circle cx={xScale(yearData.year)} cy={yScale(yearData.male)} r={5} fill={'none'} class="emphasis" />
        {/if}
        {#each lineData as point}
          <line
            x1={xScale(point.year)}
            x2={xScale(point.year)}
            y1={yScale(point.female)}
            y2={yScale(point.male)}
            style:stroke-width={currentYear == point.year ? 2.5 : 1.5}
            style:stroke={currentYear == point.year ? Colors.ColorGrey600 : Colors.ColorGrey300}
          />
          <circle
            cx={xScale(point.year)}
            cy={yScale(point.female)}
            r={LineChartCircleRadius}
            fill={Colors.ColorVisGenderFemale}
            on:mouseover={() => (currentYear = point.year)}
            on:mouseout={() => (currentYear = null)}
            on:focus={() => (currentYear = point.year)}
            on:blur={() => (currentYear = null)}
          />
          <circle
            cx={xScale(point.year)}
            cy={yScale(point.male)}
            r={LineChartCircleRadius}
            fill={Colors.ColorVisGenderMale}
            on:mouseover={() => (currentYear = point.year)}
            on:mouseout={() => (currentYear = null)}
            on:focus={() => (currentYear = point.year)}
            on:blur={() => (currentYear = null)}
          />
        {/each}
      </g>
    </svg>
  {/if}
  {#if currentYear && mousePos}
    <Tooltip visible={true} targetPos={mousePos}>
      <p class="label caps">{$_(`region.${region}`) + ', ' + currentYear}</p>
      <p class="label stronger"><Number value={yearData.male + '%'} digits={1} /></p>
      <p class="label small weaker">{$_('men')}</p>
      <hr />
      <p class="label stronger"><Number value={yearData.female + '%'} digits={1} /></p>
      <p class="label small weaker">{$_('women')}</p>
      <hr />
      <p class="label stronger"><Number value={yearData.gap} digits={1} /> {pp}</p>
      <p class="label small weaker">{gap}</p>
    </Tooltip>
  {/if}
</div>

<style>
  svg {
    overflow: visible;
  }
  .linechart {
    width: 100%;
  }
  circle {
    pointer-events: all;
  }
</style>
