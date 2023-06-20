<script>
  import { scaleLinear } from 'd3-scale';
  import { line, area, stack, curveNatural } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let region;
  export let height;
  export let showLabels;
  export let urban;
  export let rural;

  $: regionData = data.filter((d) => d.iso3c == region);
  $: stackedData = regionData ? stack().keys(['pop_without_rur', 'pop_without_urb'])(regionData) : [];
  $: total20 = regionData.find((d) => d.date == 2020).pop_without_rur + regionData.find((d) => d.date == 2020).pop_without_urb;

  let margins = {
    top: 20,
    right: 21,
    bottom: 24,
    left: 30
  };

  let w;
  let h = height;

  $: xScale = scaleLinear()
    .domain([2000, 2020])
    .range([0, w - margins.left - margins.right]);
  $: xTicks = [2000, 2010, 2020];
  $: yScale = scaleLinear()
    .domain([0, 600000000])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [200000000, 400000000, 600000000];

  $: areaGenerator = area()
    .x((d) => xScale(d.data.date))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);

  $: lineGenerator = line()
    .x((d) => xScale(d.data.date))
    .y((d) => yScale(d[1]))
    .curve(curveNatural);
</script>

<div class="stacked-area" bind:clientWidth={w}>
  <p class="title caps centered">{$_(`region.${region}`)}</p>
  {#if w}
    <svg width={w} height={h}>
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
            yDivisor={1000000}
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
        {#if stackedData}
          {#each stackedData as serie, i}
            <path
              d={areaGenerator(serie)}
              fill={i == 1 ? Colors.ColorVisRuralUrbanUrban : Colors.ColorVisRuralUrbanRural}
              stroke={Colors.ColorThemeBgWeaker}
              stroke-width={1}
            />
            {#if i == 1}
              <path d={lineGenerator(serie)} style:stroke={Colors.ColorThemeBgWeaker} class="total-line-bg" />
              <path d={lineGenerator(serie)} style:stroke={Colors.ColorVisReference} class="total-line" />
            {/if}
          {/each}
        {/if}
        <circle cx={xScale(2020)} cy={yScale(total20)} r={LineChartCircleRadius} fill={Colors.ColorVisReference} />
        <text class="number middle" x={xScale(2020)} y={yScale(total20) - 8}><Number value={total20 / 1000000} digits={1} /></text>

        {#if showLabels}
          <text class="category white" x={xScale(2010)} y={yScale(490000000)} text-anchor="middle">{urban}</text>
          <text class="category white" x={xScale(2010)} y={yScale(250000000)} text-anchor="middle">{rural}</text>
        {/if}
      </g>
    </svg>
  {/if}
</div>

<style>
  .stacked-area {
    width: 100%;
  }
</style>
