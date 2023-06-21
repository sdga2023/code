<script>
  import { scaleLinear } from 'd3-scale';
  import { extent } from 'd3-array';
  import { line, area, curveNatural, sum, curveCatmullRom } from 'd3';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import Tooltip from './../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import Lens from '../general/Lens.svelte';

  export let data;
  export let geo;
  export let geoType;
  export let height;
  export let precovid;
  export let current;
  export let noTitle;
  export let annotation;
  export let change;
  export let absolutedifference;
  export let id;

  let margins = {
    top: 0,
    right: 14,
    bottom: 16,
    left: 24
  };

  let w;
  let h = height;

  $: geoData = data ? data.filter((d) => d.iso3c === geo) : [];

  $: xScale = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2019, 2020, 2021, 2022, 2023, 2024];
  $: yMin = id == 'tourism' || ['BHS', 'FJI', 'MUS', 'THA'].includes(geo) ? 70 : id == 'guy-lby' || geo == 'GUY' || geo == 'LBY' ? 80 : 90;
  $: yMax =
    geo == 'WLD'
      ? 120
      : id == 'tourism' || ['BHS', 'FJI', 'MUS', 'THA'].includes(geo)
      ? 110
      : id == 'guy-lby' || geo == 'GUY' || geo == 'LBY'
      ? 300
      : 130;
  $: yScale = scaleLinear()
    .domain([yMin, yMax])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = geo == 'WLD' ? [90, 100, 110] : [90, 100, 110, 120, 130];
  $: if (id == 'tourism' || ['BHS', 'FJI', 'MUS', 'THA'].includes(geo)) {
    yTicks = [80, 90, 100, 110];
  }
  $: if (id == 'guy-lby' || geo == 'GUY' || geo == 'LBY') {
    yTicks = [100, 200, 300];
  }

  $: gdpLine = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp))
    .curve(curveCatmullRom);
  $: forcLine = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp_forc20))
    .curve(curveCatmullRom);
  $: diffArea = area()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(d.gdp))
    .y1((d) => yScale(d.gdp_forc20))
    .curve(curveCatmullRom);

  $: preCovidAngle = (Math.atan((yScale(113.915) - yScale(100)) / (w - margins.left - margins.right)) * 180) / Math.PI;

  let currentYear;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
  $: geoName = geoType == 'region' ? $_(`region.${geo}`) : $_(`country.${geo.toLowerCase()}`);

  $: relDifference = currentYear ? geoData.find((d) => d.year == currentYear).gap_relative : null;
  $: absDifference = currentYear ? geoData.find((d) => d.year == currentYear).gap_dollars : null;

  $: sum_differences = sum(geoData, (d) => d.gdp - d.gdp_forc20);
</script>

<div class="differencechart linechart" bind:clientWidth={w}>
  {#if w}
    {#if !noTitle}
      {#if geoType == 'region'}
        <p class="title caps">{$_(`region.${geo}`)}</p>
      {/if}
      {#if geoType == 'country'}
        <p class="title caps">{$_(`country.${geo.toLowerCase()}`)}</p>
      {/if}
    {/if}
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if h && w && yScale && yTicks}
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
        {#if h && w && yScale && yTicks}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
            hideLines="true"
          />
        {/if}

        <path d={diffArea(geoData)} style:fill={sum_differences > 0 ? Colors.ColorVisBinaryPos : Colors.ColorVisBinaryNeg} class="area" />
        {#each geoData as diff}
          <rect
            x={xScale(diff.year) - 3}
            y={Math.min(yScale(diff.gdp), yScale(diff.gdp_forc20))}
            width={4}
            height={Math.abs(yScale(diff.gdp_forc20) - yScale(diff.gdp))}
            fill={diff.gdp < diff.gdp_forc20 ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
            rx="3"
            stroke={Colors.ColorGrey700}
            stroke-width={currentYear == diff.year ? 1.5 : 0}
            on:mouseover={() => (currentYear = diff.year)}
            on:mouseout={() => (currentYear = null)}
            on:focus={() => (currentYear = diff.year)}
            on:blur={() => (currentYear = null)}
          />
        {/each}
        <path d={forcLine(geoData)} class="bg" />
        <path d={forcLine(geoData)} stroke={Colors.ColorGrey300} class="projection" />
        <path d={gdpLine(geoData)} class="bg" />
        <path d={gdpLine(geoData)} style:stroke={sum_differences > 0 ? Colors.ColorVisBinaryPos : Colors.ColorVisBinaryNeg} />

        {#if geo == 'WLD'}
          <text text-anchor="middle" transform={`translate(${xScale(2021.5)},${yScale(107)}) rotate(${preCovidAngle})`} class={'caps'}
            >{precovid}</text
          >
          <text text-anchor="middle" transform={`translate(${xScale(2022)},${yScale(103.7)}) rotate(${preCovidAngle - 1.5})`} class={'caps'}
            >{current}</text
          >
          <line x1={xScale(2020)} x2={xScale(2020)} y1={yScale(112)} y2={yScale(99.7) - 40} stroke={Colors.ColorGrey200} stroke-width={2} />
          <Lens x={xScale(2020)} y={yScale(99.7)} r={45} />
        {/if}
      </g>
    </svg>
    {#if geo == 'WLD'}
      <div class="annotation">{@html annotation}</div>
    {/if}
    {#if currentYear && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p class="label caps">{geoName + ', ' + currentYear}</p>
        <p class="label stronger"><Number value={relDifference + '%'} digits={1} /></p>
        <p class="label small weaker">{change}</p>
        <hr />
        <p class="label stronger"><Number value={absDifference / 1000000000} digits={2} /></p>
        <p class="label small weaker">{absolutedifference}</p>
      </Tooltip>
    {/if}
  {/if}
</div>

<style>
  .differencechart {
    position: relative;
    width: 100%;
  }
  svg {
    overflow: visible;
  }
  .annotation {
    position: absolute;
    left: 30px;
    top: 0px;
    background-color: var(--color-theme-bg);
    max-width: 350px;
    padding: var(--space-xs);
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
    border: 0.5px solid var(--color-grey-200);
  }

  path {
    pointer-events: none;
  }
</style>
