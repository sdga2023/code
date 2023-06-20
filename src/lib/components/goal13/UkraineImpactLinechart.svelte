<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveCatmullRom } from 'd3-shape';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let yaxistitle;
  export let yaxisunits;
  export let january;
  export let december;

  let months = {
    '1': january,
    '12': december
  };

  let margins = {
    top: 30,
    right: 30,
    bottom: 20,
    left: 24
  };

  let w;
  let h = 450;

  $: xScale = scaleLinear()
    .domain([1, 12])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [1, 12];
  let yDomain = [0, 400];
  $: yScale = scaleLinear()
    .domain(yDomain)
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 100, 200, 300, 400];

  $: lineGenerator = line()
    .x((d) => xScale(d.month))
    .y((d) => yScale(d.value))
    .curve(curveCatmullRom);
</script>

<div bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h} class="linechart">
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
            yAxisTitle={yaxistitle}
            yAxisUnits={yaxisunits}
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
            hideLines={true}
            xLabelTranslations={months}
          />
        {/if}
        {#each [2019, 2020, 2021, 2022] as year, i}
          {#if year == 2022}
            <path d={lineGenerator(data.filter((d) => d.year == 2022))} fill={'none'} stroke={'white'} style:stroke-width={4} />
          {/if}
          <path
            d={lineGenerator(data.filter((d) => d.year == year))}
            fill={'none'}
            stroke={year != 2022 ? Colors.ColorBasePurple500 : Colors.ColorBasePink500}
            opacity={0.25 + i * 0.25}
          />
        {/each}
        {#each data.filter((d) => d.month == 1 || d.month == 12) as point}
          <circle
            cx={xScale(point.month)}
            cy={yScale(point.value)}
            r={Tokens.LineChartCircleRadius}
            fill={point.year != 2022 ? Colors.ColorBasePurple500 : Colors.ColorBasePink500}
          />
        {/each}
        <text x={xScale(6.5)} y={yScale(250)} style:fill={Colors.ColorBasePink500} class="number">{2022}</text>
      </g>
    </svg>
  {/if}
</div>
